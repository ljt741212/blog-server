import { StateGraph, END, START } from "@langchain/langgraph";
import { AIMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

import { AgentState } from "./state.js";
import { makeCallAgent, makeExecuteTool } from "./nodes.js";
import { createChatModel } from "./chat-model.js";
import type { LlmConfig } from "../tools/types.js";

export interface BuildAgentOptions {
  llmConfig: LlmConfig;
  tools: StructuredTool[];
  dangerousToolNames: string[];
  checkpointer?: BaseCheckpointSaver;
}

export function buildAgent(options: BuildAgentOptions) {
  const model = createChatModel(options.llmConfig);
  const modelWithTools = (model as any).bindTools(options.tools) as BaseChatModel;

  const graph = new StateGraph(AgentState)
    .addNode("agent", makeCallAgent(modelWithTools))
    .addNode("tools", makeExecuteTool(options.tools, new Set(options.dangerousToolNames)))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", afterAgent, { tools: "tools", end: END })
    .addEdge("tools", "agent");

  return graph.compile({ checkpointer: options.checkpointer });
}

function afterAgent(state: typeof AgentState.State): "tools" | "end" {
  const lastMessage = state.messages[state.messages.length - 1];
  const toolCalls = (lastMessage as AIMessage).tool_calls;
  if (toolCalls && toolCalls.length > 0) return "tools";
  return "end";
}