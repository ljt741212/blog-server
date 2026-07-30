import { SystemMessage, type BaseMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DecisionRecord } from "../agent/state";
import type { LlmConfig } from "../tools/types";
import { TokenCounter } from "./token-counter";
import { compactMessages, type CompactionResult } from "./compressor";
import { type ContextPacket, type ContextConfig, DEFAULT_CONTEXT_CONFIG } from "./types";

export { type CompactionResult } from "./compressor";

export class ContextManager {
  private readonly config: ContextConfig;
  readonly tokenCounter: TokenCounter;
  private summary: string = "";
  private decisions: DecisionRecord[] = [];

  constructor(
    llmConfig: LlmConfig,
    config?: Partial<ContextConfig>,
  ) {
    this.config = { ...DEFAULT_CONTEXT_CONFIG, ...config };
    this.tokenCounter = TokenCounter.fromConfig(llmConfig);
  }

  /** Restore internal summary/decisions from persisted AgentState (e.g. after server restart). */
  restore(stateSummary: string, stateDecisions: DecisionRecord[]) {
    if (stateSummary && !this.summary) {
      this.summary = stateSummary;
    }
    if (stateDecisions.length && !this.decisions.length) {
      this.decisions = [...stateDecisions];
    }
  }

  // ==================== GSSC Pipeline ====================

  async build(
    messages: BaseMessage[],
    systemPrompt: string,
    turnCount: number,
  ): Promise<BaseMessage[]> {
    const budget = this.tokenCounter.getBudgetLimit();
    const availableTokens = Math.floor(budget * (1 - this.config.reserveRatio));

    const packets = this.gather(messages, systemPrompt, turnCount);
    const selected = this.select(packets, availableTokens);
    const structuredContext = this.structure(selected);

    return [new SystemMessage(structuredContext)];
  }

  // ==================== Compaction ====================

  async compact(
    model: BaseChatModel,
    messages: BaseMessage[],
  ): Promise<CompactionResult> {
    if (messages.length < 4) {
      return { summary: this.summary, decisions: [...this.decisions] };
    }

    const splitIdx = Math.floor(messages.length * 0.6);
    const oldMessages = messages.slice(0, splitIdx);

    const result = await compactMessages(
      model,
      oldMessages,
      this.summary,
      this.decisions,
      this.tokenCounter,
    );

    this.summary = result.summary;
    this.decisions = result.decisions;

    return result;
  }

  getSummary(): string {
    return this.summary;
  }

  getDecisions(): DecisionRecord[] {
    return [...this.decisions];
  }

  // ==================== Private: GSSC Steps ====================

  private gather(
    messages: BaseMessage[],
    systemPrompt: string,
    turnCount: number,
  ): ContextPacket[] {
    const packets: ContextPacket[] = [];
    const now = new Date();

    // System prompt — always kept
    if (systemPrompt) {
      packets.push({
        content: systemPrompt,
        tokenCount: this.tokenCounter.count(systemPrompt),
        relevanceScore: 1.0,
        timestamp: now,
        metadata: { type: "system_prompt", turnIndex: 0 },
      });
    }

    // Long-term summary from compaction
    if (this.summary) {
      packets.push({
        content: `[历史摘要]\n${this.summary}`,
        tokenCount: this.tokenCounter.count(this.summary),
        relevanceScore: 0.85,
        timestamp: new Date(now.getTime() - 3600000),
        metadata: { type: "summary", turnIndex: -1 },
      });
    }

    // Recent decisions from compaction
    if (this.decisions.length > 0) {
      const decisionText = JSON.stringify(this.decisions.slice(-10));
      packets.push({
        content: `[近期决策]\n${decisionText}`,
        tokenCount: this.tokenCounter.count(decisionText),
        relevanceScore: 0.9,
        timestamp: now,
        metadata: { type: "decision", turnIndex: turnCount },
      });
    }

    // Individual messages (skip system since already covered above)
    messages.forEach((msg, i) => {
      const role = msg.getType?.() ?? msg._getType?.() ?? "unknown";
      if (role === "system") return;

      const content = typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
      const type =
        role === "tool" ? "tool_result" :
        role === "ai" ? "chat" :
        "chat";

      packets.push({
        content: `[${role}]: ${content}`,
        tokenCount: this.tokenCounter.count(content) + 4,
        relevanceScore: this.calcRelevance(type, i, messages.length),
        timestamp: new Date(now.getTime() - (messages.length - i) * 60000),
        metadata: { type, turnIndex: i },
      });
    });

    return packets;
  }

  private select(packets: ContextPacket[], availableTokens: number): ContextPacket[] {
    const systemPackets = packets.filter((p) => p.metadata.type === "system_prompt");
    const otherPackets = packets.filter((p) => p.metadata.type !== "system_prompt");

    const systemTokens = systemPackets.reduce((s, p) => s + p.tokenCount, 0);
    const remaining = availableTokens - systemTokens;
    if (remaining <= 0) return systemPackets;

    const scored = otherPackets
      .filter((p) => p.relevanceScore >= this.config.minRelevance)
      .map((p) => ({
        score: this.config.relevanceWeight * p.relevanceScore
             + this.config.recencyWeight * this.calcRecency(p.timestamp),
        packet: p,
      }))
      .sort((a, b) => b.score - a.score);

    const selected = [...systemPackets];
    let used = systemTokens;
    for (const { packet } of scored) {
      if (used + packet.tokenCount > availableTokens) break;
      selected.push(packet);
      used += packet.tokenCount;
    }

    return selected;
  }

  private structure(packets: ContextPacket[]): string {
    const sections: string[] = [];
    const system = packets.find((p) => p.metadata.type === "system_prompt");
    const summary = packets.find((p) => p.metadata.type === "summary");
    const decisions = packets.filter((p) => p.metadata.type === "decision");
    const chats = packets.filter((p) =>
      ["chat", "tool_call", "tool_result"].includes(p.metadata.type),
    );

    if (system) sections.push(`[Role & Policies]\n${system.content}`);
    if (summary) sections.push(`[Summary]\n${summary.content}`);
    if (decisions.length) sections.push(`[Recent Decisions]\n${decisions.map((d) => d.content).join("\n")}`);
    if (chats.length) sections.push(`[Conversation]\n${chats.map((c) => c.content).join("\n")}`);

    return sections.join("\n\n");
  }

  // Exponential decay, matching hello-agents Ch8
  private calcRecency(timestamp: Date): number {
    const ageHours = (Date.now() - timestamp.getTime()) / (1000 * 3600);
    return Math.max(0.1, Math.min(1.0, Math.exp((-0.1 * ageHours) / 24)));
  }

  private calcRelevance(type: string, turnIndex: number, totalTurns: number): number {
    if (type === "tool_result") return 0.55;
    if (type === "tool_call") return 0.65;
    const recencyBonus = totalTurns > 0 ? turnIndex / totalTurns : 0.5;
    return 0.5 + recencyBonus * 0.3;
  }
}
