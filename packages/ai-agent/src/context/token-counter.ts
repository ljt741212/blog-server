import type { BaseMessage } from "@langchain/core/messages";
import type { LlmConfig } from "../tools/types";

const PROVIDER_TOKEN_RATIOS: Record<string, number> = {
  openai: 4.0,
  deepseek: 4.0,
  anthropic: 3.5,
};

const BUDGET_LIMITS: Record<string, number> = {
  openai: 96_000,
  deepseek: 48_000,
  anthropic: 160_000,
};

const COMPRESSION_TRIGGER_RATIO = 0.7;
const COMPRESSION_TARGET_RATIO = 0.4;

export interface BudgetInfo {
  currentTokens: number;
  budgetLimit: number;
  triggerTokens: number;
  targetTokens: number;
  needsCompression: boolean;
}

export class TokenCounter {
  private readonly provider: string;

  constructor(provider: string) {
    this.provider = provider;
  }

  count(text: string): number {
    const ratio = PROVIDER_TOKEN_RATIOS[this.provider] ?? 4.0;
    return Math.ceil(text.length / ratio);
  }

  countMessages(messages: BaseMessage[]): number {
    let total = 0;
    for (const msg of messages) {
      const content = msg.content;
      if (typeof content === "string") {
        total += this.count(content);
      } else if (Array.isArray(content)) {
        for (const block of content) {
          if (typeof block === "string") {
            total += this.count(block);
          } else if (block && typeof block === "object" && "text" in block) {
            total += this.count(String((block as { text: string }).text));
          }
        }
      }
      total += 4;
    }
    return total;
  }

  countToolResult(raw: unknown): number {
    const text = typeof raw === "string" ? raw : JSON.stringify(raw);
    return this.count(text);
  }

  getBudgetLimit(): number {
    return BUDGET_LIMITS[this.provider] ?? 64_000;
  }

  getBudgetInfo(currentTokens: number): BudgetInfo {
    const budgetLimit = this.getBudgetLimit();
    const triggerTokens = Math.floor(budgetLimit * COMPRESSION_TRIGGER_RATIO);
    const targetTokens = Math.floor(budgetLimit * COMPRESSION_TARGET_RATIO);
    return {
      currentTokens,
      budgetLimit,
      triggerTokens,
      targetTokens,
      needsCompression: currentTokens > triggerTokens,
    };
  }

  static fromConfig(config: LlmConfig): TokenCounter {
    return new TokenCounter(config.provider);
  }
}

export const MAX_TOOL_RESULT_TOKENS = 2000;
