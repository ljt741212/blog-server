import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { interrupt } from "@langchain/langgraph";
import { AgentState } from "./state";
import { ContextManager } from "../context/context-manager";
import { TokenCounter, MAX_TOOL_RESULT_TOKENS } from "../context/token-counter";

interface SseEmitter {
  emitToolCall(name: string, args: Record<string, unknown>): void;
  emitToolResult(name: string, result: unknown): void;
  emitConfirm(name: string, args: Record<string, unknown>, message: string): void;
}

const CONFIRM_MESSAGES: Record<string, (a: Record<string, unknown>) => string> = {
  delete_post: (a) => `确认删除文章 #${a.id}？此操作不可恢复。`,
  delete_category: (a) => `确认删除分类 #${a.id}？若分类下有文章将无法删除。`,
  delete_tag: (a) => `确认删除标签 #${a.id}？`,
  delete_comment: (a) => `确认删除评论 #${a.id}？`,
  delete_friend_link: (a) => `确认删除友链 #${a.id}？`,
  delete_guest_message: (a) => `确认删除留言 #${a.id}？`,
  delete_announcement: (a) => `确认删除公告 #${a.id}？`,
  delete_changelog: (a) => `确认删除更新日志 #${a.id}？`,
  import_data: () => "确认导入数据？这将覆盖现有数据，请确保已备份。",
};

function confirmMessage(toolName: string, args: Record<string, unknown>): string {
  return CONFIRM_MESSAGES[toolName]?.(args) ?? `确认执行 ${toolName}？`;
}

// ---- Retry ----

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const delays = [1000, 2000, 4000];
  let lastErr: any;
  for (let i = 0; i <= delays.length; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (i < delays.length && isRetryable(err)) {
        console.warn(`[Retry] ${label} #${i + 1} failed, retry in ${delays[i]}ms: ${err.message}`);
        await new Promise((r) => setTimeout(r, delays[i]));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

function isRetryable(err: any): boolean {
  const msg = (err?.message ?? "").toLowerCase();
  return /429|rate.limit|too.many|5\d\d|503|502|504|internal.server.error|bad.gateway|service.unavailable|timeout|timed.out|econnreset|econnrefused|socket/i.test(msg);
}

// ---- Agent node ----

export function makeCallAgent(
  modelWithTools: BaseChatModel,
  compactionModel: BaseChatModel,
  contextManager: ContextManager,
) {
  return async (state: typeof AgentState.State, _config: RunnableConfig) => {
    const messages = state.messages as any[];

    // Sync ContextManager from persisted state (survives server restart)
    contextManager.restore(state.longTermSummary || "", state.decisions || []);

    // Compaction: trigger when >70% budget and enough messages (non-fatal)
    let compactionUpdates: Record<string, any> | null = null;
    const tokenCounter = contextManager.tokenCounter;
    const budgetInfo = tokenCounter.getBudgetInfo(tokenCounter.countMessages(messages));
    if (budgetInfo.needsCompression && messages.length > 6) {
      try {
        const result = await contextManager.compact(compactionModel, messages);
        compactionUpdates = { longTermSummary: result.summary, decisions: result.decisions };
      } catch (err: any) {
        console.warn(`[Compaction] skipped: ${err.message}`);
      }
    }

    // GSSC: full pipeline only when enough context to benefit
    const contextMessages = messages.length >= 4
      ? await contextManager.build(messages, state.longTermSummary || "", state.turnCount)
      : messages.filter((m: any) => (m._getType?.() ?? "") === "system");

    // Recent non-system messages for continuity
    const recentMessages = messages
      .slice(-8)
      .filter((m: any) => (m._getType?.() ?? m.getType?.() ?? "") !== "system");

    const response = await withRetry(
      () => modelWithTools.invoke([...contextMessages, ...recentMessages], _config),
      "agent-llm-call",
    );

    const updates: any = { messages: [response], turnCount: 1 };
    if (compactionUpdates) Object.assign(updates, compactionUpdates);
    return updates;
  };
}

// ---- Tool execution node ----

export function makeExecuteTool(
  tools: StructuredTool[],
  dangerousToolNames: Set<string>,
  tokenCounter: TokenCounter,
) {
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  return async (state: typeof AgentState.State, config: RunnableConfig) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = (lastMessage as AIMessage).tool_calls ?? [];
    const emit = config.configurable?.sseEmitter as SseEmitter | undefined;

    const results: ToolMessage[] = [];

    for (const tc of toolCalls) {
      if (dangerousToolNames.has(tc.name)) {
        emit?.emitConfirm(tc.name, tc.args, confirmMessage(tc.name, tc.args));
        const decision = (interrupt({ type: "confirm", toolName: tc.name, toolArgs: tc.args }) ?? { confirm: false }) as { confirm: boolean };
        if (!decision.confirm) {
          results.push(new ToolMessage({ tool_call_id: tc.id!, content: "用户取消了此操作" }));
          continue;
        }
      }

      const tool = toolMap.get(tc.name);
      if (!tool) {
        results.push(new ToolMessage({ tool_call_id: tc.id!, content: `未知工具: ${tc.name}` }));
        continue;
      }

      emit?.emitToolCall(tc.name, tc.args);
      const raw = await tool.invoke(tc.args);
      emit?.emitToolResult(tc.name, raw);

      const fullText = typeof raw === "string" ? raw : JSON.stringify(raw);
      results.push(new ToolMessage({
        tool_call_id: tc.id!,
        content: truncateToolResult(fullText, tokenCounter),
      }));
    }

    return { messages: results };
  };
}

function truncateToolResult(text: string, counter: TokenCounter): string {
  if (counter.count(text) <= MAX_TOOL_RESULT_TOKENS) return text;
  const headLen = Math.floor(text.length * 0.4);
  const tailLen = Math.floor(text.length * 0.3);
  return text.slice(0, headLen)
    + `\n\n... [中间 ${counter.count(text.slice(headLen, text.length - tailLen))} tokens 已省略] ...\n\n`
    + text.slice(text.length - tailLen);
}
