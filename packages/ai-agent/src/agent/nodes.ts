import { AIMessage, BaseMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { interrupt } from "@langchain/langgraph";
import { AgentState } from "./state";
import { getMsgType } from "./message-helper";
import { ContextManager } from "../context/context-manager";
import { TokenCounter, MAX_TOOL_RESULT_TOKENS } from "../context/token-counter";

// ---- Helpers ----

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// ---- Retry ----

const RETRY_DELAYS = [1000, 2000, 4000];

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= RETRY_DELAYS.length; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      if (i < RETRY_DELAYS.length && isRetryable(err)) {
        console.warn(`[Retry] ${label} #${i + 1} failed, retry in ${RETRY_DELAYS[i]}ms: ${errMsg(err)}`);
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[i]));
      } else {
        throw err;
      }
    }
  }
  throw lastErr;
}

function isRetryable(err: unknown): boolean {
  const msg = errMsg(err).toLowerCase();
  return /429|rate.limit|too.many|5\d\d|503|502|504|internal.server.error|bad.gateway|service.unavailable|timeout|timed.out|econnreset|econnrefused|socket/i.test(msg);
}

// ---- Agent node ----

export function makeCallAgent(
  modelWithTools: BaseChatModel,
  compactionModel: BaseChatModel,
  contextManager: ContextManager,
) {
  return async (state: typeof AgentState.State, _config: RunnableConfig) => {
    const { messages, longTermSummary, decisions, turnCount } = state;

    contextManager.restore(longTermSummary || "", decisions || []);

    // Compaction (non-fatal)
    let compactionUpdates: Record<string, unknown> | null = null;
    const tc = contextManager.tokenCounter;
    if (tc.getBudgetInfo(tc.countMessages(messages)).needsCompression && messages.length > 6) {
      try {
        const r = await contextManager.compact(compactionModel, messages);
        compactionUpdates = { longTermSummary: r.summary, decisions: r.decisions };
      } catch (err: unknown) {
        console.warn(`[Compaction] skipped: ${errMsg(err)}`);
      }
    }

    const contextMessages = await contextManager.build(messages, longTermSummary || "", turnCount);
    const recentMessages = messages.slice(-8).filter((m) => getMsgType(m) !== "system");

    const response = await withRetry(
      () => modelWithTools.invoke([...contextMessages, ...recentMessages], _config),
      "agent-llm-call",
    );

    const updates: Record<string, unknown> = { messages: [response], turnCount: 1 };
    if (compactionUpdates) Object.assign(updates, compactionUpdates);
    return updates;
  };
}

// ---- Tool execution node ----

const CONFIRM_MSGS: Record<string, (a: Record<string, unknown>) => string> = {
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

export function makeExecuteTool(
  tools: StructuredTool[],
  dangerousToolNames: Set<string>,
  tokenCounter: TokenCounter,
) {
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  return async (state: typeof AgentState.State, config: RunnableConfig) => {
    const toolCalls = (state.messages.at(-1) as AIMessage)?.tool_calls ?? [];
    const emit = config.configurable?.sseEmitter as {
      emitToolCall(n: string, a: Record<string, unknown>): void;
      emitToolResult(n: string, r: unknown): void;
      emitConfirm(n: string, a: Record<string, unknown>, m: string): void;
    } | undefined;

    const results: ToolMessage[] = [];

    for (const tc of toolCalls) {
      if (dangerousToolNames.has(tc.name)) {
        const msg = CONFIRM_MSGS[tc.name]?.(tc.args) ?? `确认执行 ${tc.name}？`;
        emit?.emitConfirm(tc.name, tc.args, msg);
        const decision = interrupt({ type: "confirm", toolName: tc.name, toolArgs: tc.args }) as { confirm?: boolean } | undefined;
        if (!decision?.confirm) {
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

      const text = typeof raw === "string" ? raw : JSON.stringify(raw);
      results.push(new ToolMessage({
        tool_call_id: tc.id!,
        content: truncateToolResult(text, tokenCounter),
      }));
    }

    return { messages: results };
  };
}

function truncateToolResult(text: string, counter: TokenCounter): string {
  if (counter.count(text) <= MAX_TOOL_RESULT_TOKENS) return text;
  const headLen = Math.floor(text.length * 0.4);
  const tailLen = Math.floor(text.length * 0.3);
  const mid = text.slice(headLen, text.length - tailLen);
  return `${text.slice(0, headLen)}\n\n... [中间 ${counter.count(mid)} tokens 已省略] ...\n\n${text.slice(-tailLen)}`;
}
