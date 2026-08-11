import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel } from "../agent/chat-model";
import { createTool, success, error } from "./helper";
import type { ToolServices, LlmConfig } from "./types";

// Sub-agent orchestration matching hello-agents Ch14:
// Planner → N×Worker (isolated clean context) → Synthesizer.
// Workers get clean contexts (LLM only, no tools); data retrieval is
// handled by the main agent before delegating.

let _llmConfig: LlmConfig | null = null;

export function setDeepTaskLlmConfig(config: LlmConfig) {
  _llmConfig = config;
}

function getConfig(): LlmConfig {
  if (!_llmConfig) throw new Error("Deep task LLM config not set");
  return _llmConfig;
}

// ============ Phase 1: PLAN ============

const PLAN_SYSTEM = `你是任务规划专家。将用户的主题分解为 3-5 个子任务并生成搜索/执行指令。

返回纯 JSON 数组（不要 markdown 代码块）：
[{"title":"子任务标题","intent":"为什么做","searchQuery":"搜索已有内容的关键词","action":"执行指令"}]`;

async function planDecomposition(topic: string): Promise<Array<{
  title: string; intent: string; searchQuery: string; action: string;
}>> {
  const model = createChatModel({ ...getConfig(), temperature: 0.3 });
  const resp = await model.invoke([
    new SystemMessage(PLAN_SYSTEM),
    new HumanMessage(`主题：${topic}`),
  ]);
  const text = typeof resp.content === "string" ? resp.content : "";
  const json = text.replace(/```json\s*|```/g, "").trim();
  return JSON.parse(json);
}

// ============ Phase 2: EXECUTE ============

async function preFetchData(
  tasks: Array<{ searchQuery: string }>,
  svc: ToolServices,
): Promise<Record<number, string>> {
  const fetched: Record<number, string> = {};
  for (let i = 0; i < tasks.length; i++) {
    const q = tasks[i].searchQuery;
    if (!q) continue;
    try {
      // Search existing posts using the post service
      const posts = await svc.postService.findPage({ searchValue: q, pageSize: 3 });
      if (posts?.items?.length) {
        fetched[i] = posts.items
          .map((p) => `[文章: ${p.title}] ${p.summary ?? ""}`.slice(0, 300))
          .join("\n");
      }
    } catch {
      // Data fetch is best-effort; worker still has LLM knowledge
    }
  }
  return fetched;
}

const WORKER_SYSTEM = `你是专项执行者。在干净上下文中执行一个子任务。

## 子任务信息
- 标题: {title}
- 意图: {intent}
- 执行指令: {action}

## 相关已有内容（来自博客）
{context}

## 要求
1. 聚焦子任务，输出结构化 Markdown，500 字以内
2. 如果上面有"相关已有内容"，优先参考和引用
3. 如果没有，使用你自己的知识完成`;

async function executeSubtask(
  task: { title: string; intent: string; action: string },
  contextData: string,
): Promise<string> {
  const model = createChatModel({ ...getConfig(), temperature: 0.5 });
  const prompt = WORKER_SYSTEM
    .replace("{title}", task.title)
    .replace("{intent}", task.intent)
    .replace("{action}", task.action)
    .replace("{context}", contextData || "(无)");

  const resp = await model.invoke([
    new SystemMessage(prompt),
    new HumanMessage(`请执行：${task.action}`),
  ]);

  return typeof resp.content === "string" ? resp.content : JSON.stringify(resp.content);
}

// ============ Phase 3: SYNTHESIZE ============

const SYNTHESIZE_SYSTEM = `你是内容整合专家。将多个子任务的结果整合为完整输出。

要求：按逻辑顺序组织、去重、统一风格、加概述和总结、输出 Markdown。`;

async function synthesizeResults(topic: string, style: string, results: string[]): Promise<string> {
  const model = createChatModel({ ...getConfig(), temperature: 0.5 });
  const parts = results.map((r, i) => `### 子任务 ${i + 1}\n${r}`).join("\n\n");
  const resp = await model.invoke([
    new SystemMessage(SYNTHESIZE_SYSTEM),
    new HumanMessage(`主题：${topic}${style ? `\n风格要求：${style}` : ""}\n\n${parts}`),
  ]);
  return typeof resp.content === "string" ? resp.content : "";
}

// ============ TOOL ============

export function createDeepTaskTool(svc: ToolServices): StructuredTool {
  return createTool(
    "deep_task",
    `执行复杂的多步任务（研究/写作/分析）。内部流程：
1. 将主题分解为 3-5 个子任务（Planner）
2. 搜索博客中相关内容作为参考
3. 每个子任务在独立上下文中执行（Worker × N）
4. 整合结果输出完整内容（Synthesizer）
适用于：写长文章、分析站点策略、批量研究等需要多步推理的任务。`,
    z.object({
      topic: z.string().describe("主题或需求，越具体越好"),
      style: z.string().optional().describe("输出风格：学术/口语化/简洁"),
    }),
    async (args) => {
      try {
        const tasks = await planDecomposition(args.topic);
        if (!tasks.length) return error("无法分解此任务，请更具体地描述");

        const contexts = await preFetchData(tasks, svc);

        const results: string[] = [];
        for (let i = 0; i < tasks.length; i++) {
          const r = await executeSubtask(tasks[i], contexts[i] ?? "");
          results.push(r);
        }

        const final = await synthesizeResults(args.topic, args.style ?? "", results);

        return success("深度任务完成", {
          subtaskCount: tasks.length,
          result: final,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return error(`深度任务执行失败: ${msg}`);
      }
    },
  );
}

export default [createDeepTaskTool];
