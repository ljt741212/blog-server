import { SystemMessage, type BaseMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DecisionRecord } from "../agent/state";
import { getMsgType } from "../agent/message-helper";
import type { LlmConfig } from "../tools/types";
import { TokenCounter } from "./token-counter";
import { compactMessages, type CompactionResult } from "./compressor";
import { type ContextPacket, type ContextConfig, DEFAULT_CONTEXT_CONFIG } from "./types";

export { type CompactionResult } from "./compressor";

export class ContextManager {
  readonly tokenCounter: TokenCounter;
  private readonly config: ContextConfig;
  private summary = "";
  private decisions: DecisionRecord[] = [];

  constructor(llmConfig: LlmConfig, config?: Partial<ContextConfig>) {
    this.tokenCounter = TokenCounter.fromConfig(llmConfig);
    this.config = { ...DEFAULT_CONTEXT_CONFIG, ...config };
  }

  /** Restore from AgentState after server restart. */
  restore(stateSummary: string, stateDecisions: DecisionRecord[]) {
    if (stateSummary && !this.summary) this.summary = stateSummary;
    if (stateDecisions.length && !this.decisions.length) this.decisions = [...stateDecisions];
  }

  // -- GSSC --

  async build(messages: BaseMessage[], systemPrompt: string, turnCount: number): Promise<BaseMessage[]> {
    const budget = this.tokenCounter.getBudgetLimit();
    const available = Math.floor(budget * (1 - this.config.reserveRatio));
    const packets = this.gather(messages, systemPrompt, turnCount);
    return [new SystemMessage(this.structure(this.select(packets, available)))];
  }

  // -- Compaction --

  async compact(model: BaseChatModel, messages: BaseMessage[]): Promise<CompactionResult> {
    if (messages.length < 4) return { summary: this.summary, decisions: [...this.decisions] };

    const split = Math.floor(messages.length * 0.6);
    const result = await compactMessages(model, messages.slice(0, split), this.summary, this.decisions, this.tokenCounter);
    this.summary = result.summary;
    this.decisions = result.decisions;
    return result;
  }

  // -- Private: gather / select / structure --

  private gather(messages: BaseMessage[], systemPrompt: string, turnCount: number): ContextPacket[] {
    const packets: ContextPacket[] = [];
    const now = Date.now();

    const pkt = (content: string, tokens: number, relevanceScore: number, type: ContextPacket["metadata"]["type"], turnIndex: number, ageMs = 0) =>
      packets.push({ content, tokenCount: tokens, relevanceScore, timestamp: new Date(now - ageMs), metadata: { type, turnIndex } });

    if (systemPrompt) pkt(systemPrompt, this.tokenCounter.count(systemPrompt), 1.0, "system_prompt", 0);

    if (this.summary) pkt(`[历史摘要]\n${this.summary}`, this.tokenCounter.count(this.summary), 0.85, "summary", -1, 3600000);

    if (this.decisions.length) {
      const text = JSON.stringify(this.decisions.slice(-10));
      pkt(`[近期决策]\n${text}`, this.tokenCounter.count(text), 0.9, "decision", turnCount);
    }

    messages.forEach((msg, i) => {
      const role = getMsgType(msg);
      if (role === "system") return;

      const content = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
      const type = role === "tool" ? "tool_result" : "chat";
      const relevance = this.calcRelevance(type, i, messages.length);

      pkt(`[${role}]: ${content}`, this.tokenCounter.count(content) + 4, relevance, type, i, (messages.length - i) * 60000);
    });

    return packets;
  }

  private select(packets: ContextPacket[], availableTokens: number): ContextPacket[] {
    const systemPkts = packets.filter((p) => p.metadata.type === "system_prompt");
    const others = packets.filter((p) => p.metadata.type !== "system_prompt");

    const systemTokens = systemPkts.reduce((s, p) => s + p.tokenCount, 0);
    const remaining = availableTokens - systemTokens;
    if (remaining <= 0) return systemPkts;

    const scored = others
      .filter((p) => p.relevanceScore >= this.config.minRelevance)
      .map((p) => ({
        p,
        score: this.config.relevanceWeight * p.relevanceScore + this.config.recencyWeight * this.calcRecency(p.timestamp),
      }))
      .sort((a, b) => b.score - a.score);

    const selected = [...systemPkts];
    let used = systemTokens;
    for (const { p } of scored) {
      if (used + p.tokenCount > remaining) break;
      selected.push(p);
      used += p.tokenCount;
    }
    return selected;
  }

  private structure(packets: ContextPacket[]): string {
    const parts: Record<string, string[]> = {};
    for (const p of packets) {
      const t = p.metadata.type;
      (parts[t] ??= []).push(p.content);
    }

    const sections: string[] = [];
    if (parts.system_prompt) sections.push(`[Role & Policies]\n${parts.system_prompt[0]}`);
    if (parts.summary) sections.push(`[Summary]\n${parts.summary[0]}`);
    if (parts.decision) sections.push(`[Recent Decisions]\n${parts.decision.join("\n")}`);
    if (parts.chat || parts.tool_result || parts.tool_call) {
      const all = [...(parts.chat || []), ...(parts.tool_result || []), ...(parts.tool_call || [])];
      sections.push(`[Conversation]\n${all.join("\n")}`);
    }
    return sections.join("\n\n");
  }

  // Exponential decay: e^(-0.1 × hours / 24), clamped to [0.1, 1.0]
  private calcRecency(ts: Date): number {
    const hours = (Date.now() - ts.getTime()) / 3600000;
    return Math.max(0.1, Math.exp((-0.1 * hours) / 24));
  }

  private calcRelevance(type: string, turnIndex: number, totalTurns: number): number {
    if (type === "tool_result") return 0.55;
    if (type === "tool_call") return 0.65;
    return 0.5 + (totalTurns > 0 ? turnIndex / totalTurns : 0.5) * 0.3;
  }
}
