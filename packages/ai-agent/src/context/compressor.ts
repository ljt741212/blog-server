import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DecisionRecord } from "../agent/state";
import { getMsgType } from "../agent/message-helper";
import { TokenCounter } from "./token-counter";

const SYSTEM_PROMPT = `你是对话压缩器。将对话历史压缩为结构化 JSON。

## 规则
1. 丢弃冗余的工具返回数据，只保留结论
2. 保留不可逆操作（删除、发布、审核等）及结果
3. 保留用户偏好和要求
4. 保留当前重要的数据引用（文章ID、分类名等）
5. 与已有摘要合并去重，新信息优先

## 输出格式（只输出 JSON，不要 markdown 代码块）
{
  "summary": "整体摘要，200字以内",
  "keyDecisions": [{ "action": "操作描述", "result": "结果", "resourceId": "相关ID" }],
  "unresolvedItems": ["未完成事项"],
  "userPreferences": ["用户偏好"],
  "dataSnapshots": {}
}`;

interface ParsedJson {
  summary?: string;
  keyDecisions?: { action?: string; result?: string; resourceId?: string }[];
}

export interface CompactionResult {
  summary: string;
  decisions: DecisionRecord[];
}

export async function compactMessages(
  model: BaseChatModel,
  oldMessages: BaseMessage[],
  existingSummary: string,
  existingDecisions: DecisionRecord[],
  counter: TokenCounter,
): Promise<CompactionResult> {
  const lines = oldMessages.map((m) => {
    const content = typeof m.content === "string" ? m.content.slice(0, 800) : "(tool call)";
    return `[${getMsgType(m)}]: ${content}`;
  }).join("\n");

  const prompt = `## 已有摘要\n${existingSummary || "(无)"}\n\n## 已有决策\n${JSON.stringify(existingDecisions.slice(-10))}\n\n## 对话历史\n${lines}`;

  const resp = await model.invoke([new SystemMessage(SYSTEM_PROMPT), new HumanMessage(prompt)]);

  const text = (typeof resp.content === "string" ? resp.content : JSON.stringify(resp.content))
    .replace(/```json\s*|```/g, "").trim();
  const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}") as ParsedJson;

  const newDecisions: DecisionRecord[] = (json.keyDecisions ?? []).map((d) => ({
    action: d.action || "",
    result: d.result || "",
    resourceId: d.resourceId ? String(d.resourceId) : undefined,
    timestamp: new Date().toISOString(),
  }));

  return { summary: json.summary || "", decisions: mergeDecisions(existingDecisions, newDecisions) };
}

function mergeDecisions(existing: DecisionRecord[], incoming: DecisionRecord[]): DecisionRecord[] {
  const seen = new Set(existing.map((d) => `${d.action}${d.resourceId ?? ""}`));
  const merged = [...existing];
  for (const d of incoming) {
    const key = `${d.action}${d.resourceId ?? ""}`;
    if (!seen.has(key)) { merged.push(d); seen.add(key); }
  }
  return merged.length > 30 ? merged.slice(-30) : merged;
}
