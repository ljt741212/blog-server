import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { LlmConfig } from "../tools/types";

const PROVIDER_DEFAULTS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  deepseek: "https://api.deepseek.com/v1",
};

export function createChatModel(config: LlmConfig): BaseChatModel {
  const { provider, model, apiKey, baseUrl, maxTokens = 4096, temperature = 0.7 } = config;

  switch (provider) {
    case "openai":
    case "deepseek":
      return new ChatOpenAI({
        model,
        apiKey,
        configuration: { baseURL: baseUrl || PROVIDER_DEFAULTS[provider] },
        maxTokens,
        temperature,
        streaming: true,
      });

    case "anthropic":
      return new ChatAnthropic({
        model,
        apiKey,
        anthropicApiUrl: baseUrl || undefined,
        maxTokens,
        temperature,
        clientOptions: { defaultHeaders: { "anthropic-beta": "tools-2024-04-04" } },
      });

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}