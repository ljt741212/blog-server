import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { createTool, success } from "./helper";
import type { ToolServices } from "./types";

export function createMemoryAddTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_add",
    "记住一条信息。用于保存用户姓名、偏好、习惯、重要决策等需要跨会话记住的内容。",
    z.object({
      content: z.string().describe("要记住的内容，例如：'用户叫张三，偏好口语化风格'"),
      importance: z.number().min(0).max(1).default(0.8).describe("重要性 0-1，个人信息用 0.9，一般偏好用 0.7"),
    }),
    async (args) => {
      const result = await svc.memoryService.add({
        userId: svc.getUserId(),
        content: args.content,
        importance: args.importance,
      });
      return success("已记住", { id: result.id });
    },
  );
}

export function createMemorySearchTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_search",
    "搜索之前记住的信息。当用户问'我是谁''我之前说过什么''还记得吗'等需要回顾的问题时，必须先调用此工具。",
    z.object({
      query: z.string().describe("搜索关键词，如'名字''偏好'"),
      limit: z.number().default(5).describe("返回条数"),
    }),
    async (args) => {
      const results = await svc.memoryService.search({
        userId: svc.getUserId(),
        query: args.query,
        limit: args.limit,
      });
      if (!results.length) return "未找到相关记忆";
      return JSON.stringify(results);
    },
  );
}

export function createMemoryForgetTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_forget",
    "清理记忆。strategy: importance_based(删除低价值)/time_based(删除过期)/capacity_based(容量超限时删最低价值的)。",
    z.object({
      strategy: z.enum(["importance_based", "time_based", "capacity_based"]).describe("策略"),
      threshold: z.number().optional().describe("重要性阈值"),
      maxAgeDays: z.number().optional().describe("最大保留天数"),
    }),
    async (args) => {
      const result = await svc.memoryService.forget({
        userId: svc.getUserId(),
        strategy: args.strategy,
        threshold: args.threshold,
        maxAgeDays: args.maxAgeDays,
      });
      return `已清理 ${result.deleted} 条记忆`;
    },
  );
}

export function createMemorySummaryTool(svc: ToolServices): StructuredTool {
  return createTool(
    "memory_summary",
    "查看记忆系统概览（总数、平均重要性）。",
    z.object({}),
    async () => {
      const s = await svc.memoryService.summary(svc.getUserId());
      return JSON.stringify(s);
    },
  );
}

const memoryToolFactories = [
  createMemoryAddTool,
  createMemorySearchTool,
  createMemoryForgetTool,
  createMemorySummaryTool,
];

export default memoryToolFactories;
