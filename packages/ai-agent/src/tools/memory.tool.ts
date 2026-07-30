import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { createTool, success, error } from "./helper";
import type { ToolServices } from "./types";

// Redis-backed memory storage, matching hello-agents Ch8 MemoryTool patterns.
// All operations go through the redisService interface on ToolServices.

function now(): string {
  return new Date().toISOString();
}

// ---- Scoring (matches hello-agents Ch8 formulas) ----

function calcRecencyScore(ts: string): number {
  const ageHours =
    (Date.now() - new Date(ts).getTime()) / (1000 * 3600);
  const decayFactor = 0.1;
  const score = Math.exp((-decayFactor * ageHours) / 24);
  return Math.max(0.1, Math.min(1.0, score));
}

function calcFinalScore(
  keywordScore: number,
  importance: number,
  timestamp: string,
): number {
  const recency = calcRecencyScore(timestamp);
  const importanceWeight = 0.8 + importance * 0.4;
  return keywordScore * 0.7 * recency * importanceWeight;
}

function keywordMatch(query: string, content: string): number {
  const qWords = new Set(query.toLowerCase().split(/\s+/));
  const cWords = new Set(content.toLowerCase().split(/\s+/));
  if (qWords.size === 0) return 0;
  let intersection = 0;
  for (const w of qWords) {
    if (cWords.has(w)) intersection++;
  }
  return intersection / qWords.size;
}

// ---- MemoryItem ----

interface MemoryItem {
  id: string;
  content: string;
  memoryType: "working" | "episodic" | "semantic";
  importance: number;
  timestamp: string;
  sessionId: string;
}

// ---- Helpers ----

async function getAllMemories(svc: ToolServices, userId: string): Promise<MemoryItem[]> {
  const raw = await svc.redisService.get(`memory:${userId}:all`);
  if (!raw) return [];
  return JSON.parse(raw);
}

async function saveMemories(svc: ToolServices, userId: string, items: MemoryItem[]): Promise<void> {
  await svc.redisService.set(`memory:${userId}:all`, JSON.stringify(items), 86400 * 30);
}

// ---- Tool Factories ----

export function createMemoryAddTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_add",
    "添加一条记忆。用于记住用户偏好、重要决策、待办事项等。支持 working(短期)/episodic(情节)/semantic(语义) 三种类型。",
    z.object({
      content: z.string().describe("记忆内容"),
      memory_type: z.enum(["working", "episodic", "semantic"]).default("episodic").describe("记忆类型"),
      importance: z.number().min(0).max(1).default(0.5).describe("重要性 0-1"),
    }),
    async (args) => {
      const items = await getAllMemories(svc, "default");
      const item: MemoryItem = {
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        content: args.content,
        memoryType: args.memory_type,
        importance: args.importance,
        timestamp: now(),
        sessionId: "",
      };
      items.push(item);

      // Capacity-based forgetting: working memory max 50
      if (args.memory_type === "working") {
        const working = items.filter((m) => m.memoryType === "working");
        if (working.length > 50) {
          working.sort((a, b) => a.importance - b.importance);
          const toRemove = working.slice(0, working.length - 50);
          for (const m of toRemove) {
            const idx = items.findIndex((x) => x.id === m.id);
            if (idx >= 0) items.splice(idx, 1);
          }
        }
      }

      await saveMemories(svc, "default", items);
      return success("记忆已添加", { id: item.id });
    },
  );
}

export function createMemorySearchTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_search",
    "搜索记忆。当需要回忆之前的对话内容、用户偏好或决策时使用。支持按类型和重要性过滤。",
    z.object({
      query: z.string().describe("搜索关键词"),
      memory_type: z.enum(["working", "episodic", "semantic"]).optional().describe("限定记忆类型"),
      min_importance: z.number().default(0.1).describe("最低重要性阈值"),
      limit: z.number().default(5).describe("返回条数"),
    }),
    async (args) => {
      const all = await getAllMemories(svc, "default");
      let candidates = all;

      if (args.memory_type) {
        candidates = candidates.filter((m) => m.memoryType === args.memory_type);
      }
      candidates = candidates.filter((m) => m.importance >= args.min_importance);

      const scored = candidates.map((m) => ({
        memory: m,
        score: calcFinalScore(keywordMatch(args.query, m.content), m.importance, m.timestamp),
      }));

      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, args.limit).map((s) => s.memory);

      if (top.length === 0) return "未找到相关记忆";

      return JSON.stringify(
        top.map((m) => ({
          id: m.id,
          type: m.memoryType,
          content: m.content,
          importance: m.importance,
          timestamp: m.timestamp,
        })),
      );
    },
  );
}

export function createMemoryForgetTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_forget",
    "遗忘记忆。支持三种策略：importance_based(按重要性阈值删除低价值记忆)、time_based(按时间删除过期记忆)、capacity_based(超过容量时删除最不重要的记忆)。",
    z.object({
      strategy: z.enum(["importance_based", "time_based", "capacity_based"]).describe("遗忘策略"),
      threshold: z.number().optional().describe("重要性阈值（用于 importance_based）"),
      max_age_days: z.number().optional().describe("最大保留天数（用于 time_based）"),
    }),
    async (args) => {
      const items = await getAllMemories(svc, "default");
      let before = items.length;

      if (args.strategy === "importance_based") {
        const threshold = args.threshold ?? 0.1;
        const kept = items.filter((m) => m.importance >= threshold);
        await saveMemories(svc, "default", kept);
        return `已遗忘 ${before - kept.length} 条记忆（重要性 < ${threshold}）`;
      }

      if (args.strategy === "time_based") {
        const maxAgeMs = (args.max_age_days ?? 30) * 86400_000;
        const cutoff = Date.now() - maxAgeMs;
        const kept = items.filter((m) => new Date(m.timestamp).getTime() > cutoff);
        await saveMemories(svc, "default", kept);
        return `已遗忘 ${before - kept.length} 条记忆（超过 ${args.max_age_days ?? 30} 天）`;
      }

      if (args.strategy === "capacity_based") {
        const maxItems = 200;
        if (items.length <= maxItems) return `记忆数量 ${items.length}，未超过容量上限 ${maxItems}`;
        items.sort((a, b) => a.importance - b.importance);
        const kept = items.slice(items.length - maxItems);
        await saveMemories(svc, "default", kept);
        return `已遗忘 ${before - kept.length} 条记忆（容量限制 ${maxItems}）`;
      }

      return "未知遗忘策略";
    },
  );
}

export function createMemoryConsolidateTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_consolidate",
    "将重要的短期记忆升级为长期记忆。对标认知过程中的记忆巩固。",
    z.object({
      from_type: z.enum(["working", "episodic"]).default("working").describe("源记忆类型"),
      to_type: z.enum(["episodic", "semantic"]).default("episodic").describe("目标记忆类型"),
      importance_threshold: z.number().default(0.7).describe("重要性阈值，超过此值才升级"),
    }),
    async (args) => {
      const items = await getAllMemories(svc, "default");
      let count = 0;
      for (const m of items) {
        if (m.memoryType === args.from_type && m.importance >= args.importance_threshold) {
          m.memoryType = args.to_type as "episodic" | "semantic";
          count++;
        }
      }
      await saveMemories(svc, "default", items);
      return `已将 ${count} 条记忆从 ${args.from_type} 升级到 ${args.to_type}（阈值=${args.importance_threshold}）`;
    },
  );
}

export function createMemorySummaryTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_summary",
    "获取记忆概览，了解当前记忆系统的整体状态。",
    z.object({}),
    async () => {
      const items = await getAllMemories(svc, "default");
      const byType: Record<string, number> = {};
      for (const m of items) {
        byType[m.memoryType] = (byType[m.memoryType] || 0) + 1;
      }
      const avgImportance =
        items.length > 0
          ? (items.reduce((s, m) => s + m.importance, 0) / items.length).toFixed(2)
          : "0";
      return JSON.stringify({
        total: items.length,
        byType,
        avgImportance,
      });
    },
  );
}

const memoryToolFactories = [
  createMemoryAddTool,
  createMemorySearchTool,
  createMemoryForgetTool,
  createMemoryConsolidateTool,
  createMemorySummaryTool,
];

export default memoryToolFactories;
