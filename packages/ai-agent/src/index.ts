export { buildAgent } from "./agent/graph";
export type { BuildAgentOptions } from "./agent/graph";
export { createChatModel } from "./agent/chat-model";
export { MySQLCheckpointer } from "./agent/checkpointer";
export type { CheckpointRepo } from "./agent/checkpointer";
export { RedisCheckpointer } from "./agent/redis-checkpointer";
export { createAdminTools, createEditorTools, adminToolFactories, editorToolFactories, dangerousToolNames } from "./tools/index";
export type { ToolServices, ToolFactory, EditorToolServices, EditorToolFactory, LlmConfig, AgentConfig } from "./tools/types";
export { SYSTEM_PROMPT, ARTICLE_EDITOR_PROMPT } from "./prompts/system";
export * from "./prompts/writing";

export { ContextManager, TokenCounter, MAX_TOOL_RESULT_TOKENS } from "./context";
export type { BudgetInfo, ContextPacket, ContextConfig, CompactionResult } from "./context";
export { compactMessages, DEFAULT_CONTEXT_CONFIG } from "./context";

export type { DecisionRecord } from "./agent/state";

// Re-export LangChain types needed by consumers
export { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
export { Command } from "@langchain/langgraph";
export { MemorySaver } from "@langchain/langgraph-checkpoint";

import { createAdminTools, createEditorTools } from "./tools/index";
import { buildAgent } from "./agent/graph";
import type { AgentConfig } from "./tools/types";
import type { EditorToolServices } from "./tools/types";
import { setWritingLlmConfig } from "./tools/writing.tool";
import { setDeepTaskLlmConfig } from "./tools/index";

export function createAgent(config: AgentConfig) {
  setWritingLlmConfig(config.llmConfig);
  setDeepTaskLlmConfig(config.llmConfig);
  const tools = createAdminTools(config.services);
  return buildAgent({
    llmConfig: config.llmConfig,
    tools,
    dangerousToolNames: config.dangerousToolNames,
    checkpointer: config.checkpointer,
  });
}

export function createEditorAgent(config: {
  llmConfig: AgentConfig["llmConfig"];
  services: EditorToolServices;
  checkpointer?: AgentConfig["checkpointer"];
}) {
  setWritingLlmConfig(config.llmConfig);
  const tools = createEditorTools(config.services);
  return buildAgent({
    llmConfig: config.llmConfig,
    tools,
    dangerousToolNames: [],
    checkpointer: config.checkpointer,
  });
}
