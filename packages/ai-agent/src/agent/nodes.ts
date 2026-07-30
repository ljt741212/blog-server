import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { interrupt } from "@langchain/langgraph";
import { AgentState } from "./state";

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

export function makeCallAgent(modelWithTools: BaseChatModel) {
  return async (state: typeof AgentState.State, _config: RunnableConfig) => {
    const response = await modelWithTools.invoke(state.messages, _config);
    return { messages: [response] };
  };
}

export function makeExecuteTool(tools: StructuredTool[], dangerousToolNames: Set<string>) {
  const toolMap = new Map(tools.map((t) => [t.name, t]));

  return async (state: typeof AgentState.State, config: RunnableConfig) => {
    const lastMessage = state.messages[state.messages.length - 1];
    const toolCalls = (lastMessage as AIMessage).tool_calls ?? [];
    const emit = config.configurable?.sseEmitter as
      | {
          emitToolCall(name: string, args: Record<string, unknown>): void;
          emitToolResult(name: string, result: unknown): void;
          emitConfirm(name: string, args: Record<string, unknown>, message: string): void;
        }
      | undefined;

    const results: ToolMessage[] = [];

    for (const tc of toolCalls) {
      if (dangerousToolNames.has(tc.name)) {
        emit?.emitConfirm(tc.name, tc.args, confirmMessage(tc.name, tc.args));

        const decision = (interrupt({
          type: "confirm",
          toolName: tc.name,
          toolArgs: tc.args,
        }) ?? { confirm: false }) as { confirm: boolean };

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

      results.push(
        new ToolMessage({
          tool_call_id: tc.id!,
          content: typeof raw === "string" ? raw : JSON.stringify(raw),
        }),
      );
    }

    return { messages: results };
  };
}