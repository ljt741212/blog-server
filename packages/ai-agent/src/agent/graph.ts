import { StateGraph, END, START } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

import { AgentState } from "./state";
import { makeCallAgent, makeExecuteTool } from "./nodes";
import { createChatModel } from "./chat-model";
import { ContextManager } from "../context/context-manager";
import type { LlmConfig } from "../tools/types";

export interface BuildAgentOptions {
  llmConfig: LlmConfig;
  tools: StructuredTool[];
  dangerousToolNames: string[];
  checkpointer?: BaseCheckpointSaver;
  toolChoice?: "auto" | "required" | "none";
}

export function buildAgent(options: BuildAgentOptions) {
  const model = createChatModel(options.llmConfig);
  const modelWithTools = model.bindTools!(options.tools, { tool_choice: options.toolChoice ?? "auto" }) as unknown as BaseChatModel;

  const contextManager = new ContextManager(options.llmConfig);

  const isSinglePass = options.toolChoice === "required";

  const graph = new StateGraph(AgentState)
    .addNode("agent", makeCallAgent(modelWithTools, model, contextManager))
    .addNode("tools", makeExecuteTool(options.tools, new Set(options.dangerousToolNames), contextManager.tokenCounter))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", afterAgent, { tools: "tools", end: END });

  if (isSinglePass) {
    graph.addEdge("tools", END);    // 单次直通：工具执行完即结束
  } else {
    graph.addEdge("tools", "agent"); // 标准循环：工具结果返回 agent 继续对话
  }

  return graph.compile({ checkpointer: options.checkpointer });
}

function afterAgent(state: typeof AgentState.State): "tools" | "end" {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = (lastMessage as AIMessage).tool_calls;
  if (toolCalls && toolCalls.length > 0) return "tools";
  return "end";
}
