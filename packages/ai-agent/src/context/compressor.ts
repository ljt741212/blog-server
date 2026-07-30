import { HumanMessage } from "@langchain/core/messages";
import type { BaseMessage } from "@langchain/core/messages";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DecisionRecord } from "../agent/state";
import { TokenCounter } from "./token-counter";

const COMPACT_SYSTEM_PROMPT = `你是一个对话压缩器。将对话历史压缩为结构化 JSON。

## 压缩规则
1. 丢弃冗余的工具返回数据（大量列表、详情等），只保留结论
2. 保留所有不可逆操作（删除、发布、审核等）及其结果
3. 保留用户明确表达的偏好和要求
4. 保留当前重要的数据引用（如文章ID、分类名）
5. 与已有摘要合并去重，新信息优先

## 输出格式（只输出 JSON）
{
  "summary": "整体摘要，200字以内",
  "keyDecisions": [
    { "action": "操作描述", "result": "结果", "resourceId": "相关ID" }
  ],
  "unresolvedItems": ["未完成的事项"],
  "userPreferences": ["用户偏好"],
  "dataSnapshots": { "最近文章ID": 123, "当前分类": "tech" }
}`;

export interface CompactionResult {
  summary: string;
  decisions: DecisionRecord[];
}

export async function compactMessages(
  model: BaseChatModel,
  oldMessages: BaseMessage[],
  existingSummary: string,
  existingDecisions: DecisionRecord[],
  tokenCounter: TokenCounter,
): Promise<CompactionResult> {
  const messageTexts = oldMessages.map((m) => {
    const type = m.getType?.() ?? m._getType?.() ?? "unknown";
    const content = typeof m.content === "string" ? m.content.slice(0, 800) : "(tool call)";
    return `[${type}]: ${content}`;
  }).join("\n");

  const prompt = `## 已有摘要\n${existingSummary || "(无)"}\n\n## 已有决策\n${JSON.stringify(existingDecisions.slice(-10))}\n\n## 对话历史（旧→新）\n${messageTexts}`;

  const resp = await model.invoke([
    new HumanMessage(COMPACT_SYSTEM_PROMPT + "\n\n" + prompt),
  ]);

  const text = typeof resp.content === "string" ? resp.content : JSON.stringify(resp.content);
  const jsonText = extractJson(text);
  const parsed = JSON.parse(jsonText);

  const newDecisions: DecisionRecord[] = (parsed.keyDecisions || []).map((d: any) => ({
    action: d.action || "",
    result: d.result || "",
    resourceId: d.resourceId ? String(d.resourceId) : undefined,
    timestamp: new Date().toISOString(),
  }));

  const mergedDecisions = mergeDecisions(existingDecisions, newDecisions);

  return {
    summary: parsed.summary || "",
    decisions: mergedDecisions,
  };
}

function extractJson(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  throw new Error("无法从压缩响应中提取 JSON");
}

function mergeDecisions(
  existing: DecisionRecord[],
  incoming: DecisionRecord[],
): DecisionRecord[] {
  const seen = new Set(existing.map((d) => d.action + d.resourceId));
  const merged = [...existing];
  for (const d of incoming) {
    const key = d.action + (d.resourceId ?? "");
    if (!seen.has(key)) {
      merged.push(d);
      seen.add(key);
    }
  }
  if (merged.length > 30) {
    return merged.slice(-30);
  }
  return merged;
}
