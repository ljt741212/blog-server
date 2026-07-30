export interface ContextPacket {
  content: string;
  tokenCount: number;
  relevanceScore: number;
  timestamp: Date;
  metadata: {
    type: "system_prompt" | "tool_call" | "tool_result" | "chat" | "summary" | "note" | "decision";
    toolName?: string;
    turnIndex: number;
  };
}

export interface ContextConfig {
  maxTokens: number;
  reserveRatio: number;
  minRelevance: number;
  recencyWeight: number;
  relevanceWeight: number;
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  maxTokens: 0,
  reserveRatio: 0.15,
  minRelevance: 0.1,
  recencyWeight: 0.3,
  relevanceWeight: 0.7,
};
