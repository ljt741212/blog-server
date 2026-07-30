export { buildAgent } from "./agent/graph.js";
export type { BuildAgentOptions } from "./agent/graph.js";
export { createChatModel } from "./agent/chat-model.js";
export { MySQLCheckpointer } from "./agent/checkpointer.js";
export type { CheckpointRepo } from "./agent/checkpointer.js";
export { createAllTools, dangerousToolNames } from "./tools/index.js";
export type { ToolServices, ToolFactory, LlmConfig, AgentConfig } from "./tools/types.js";
export { SYSTEM_PROMPT } from "./prompts/system.js";
export * from "./prompts/writing.js";

// Re-export LangChain types needed by consumers
export { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
export { Command } from "@langchain/langgraph";

import { createAllTools } from "./tools/index.js";
import { buildAgent } from "./agent/graph.js";
import type { AgentConfig } from "./tools/types.js";
import { setWritingLlmConfig } from "./tools/writing.tool.js";

export function createAgent(config: AgentConfig) {
  setWritingLlmConfig(config.llmConfig);
  const tools = createAllTools(config.services);
  return buildAgent({
    llmConfig: config.llmConfig,
    tools,
    dangerousToolNames: config.dangerousToolNames,
    checkpointer: config.checkpointer,
  });
}