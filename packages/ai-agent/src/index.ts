export { buildAgent } from "./agent/graph";
export type { BuildAgentOptions } from "./agent/graph";
export { createChatModel } from "./agent/chat-model";
export { MySQLCheckpointer } from "./agent/checkpointer";
export type { CheckpointRepo } from "./agent/checkpointer";
export { createAllTools, dangerousToolNames } from "./tools/index";
export type { ToolServices, ToolFactory, LlmConfig, AgentConfig } from "./tools/types";
export { SYSTEM_PROMPT } from "./prompts/system";
export * from "./prompts/writing";

// Re-export LangChain types needed by consumers
export { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
export { Command } from "@langchain/langgraph";

import { createAllTools } from "./tools/index";
import { buildAgent } from "./agent/graph";
import type { AgentConfig } from "./tools/types";
import { setWritingLlmConfig } from "./tools/writing.tool";

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