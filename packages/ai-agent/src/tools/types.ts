import { StructuredTool } from "@langchain/core/tools";

export interface ToolServices {
  postService: any;
  categoryService: any;
  tagService: any;
  commentService: any;
  friendLinkService: any;
  guestMessageService: any;
  announcementService: any;
  changelogService: any;
  siteConfigService: any;
  seoSettingService: any;
  icpInfoService: any;
  settingService: any;
  visitorService: any;
  dataTransferService: any;
  ossService: any;
}

export type ToolFactory = (services: ToolServices) => StructuredTool;

export interface LlmConfig {
  provider: "openai" | "deepseek" | "anthropic";
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentConfig {
  llmConfig: LlmConfig;
  services: ToolServices;
  dangerousToolNames: string[];
  checkpointer?: any;
}