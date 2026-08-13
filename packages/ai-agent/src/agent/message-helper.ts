import type { BaseMessage } from "@langchain/core/messages";

/** Extract the message type string from a LangChain BaseMessage. */
export function getMsgType(m: BaseMessage): string {
  const t = m._getType?.() ?? m.getType?.();
  if (t) return t;

  // 从 Redis checkpoint 反序列化后可能是普通对象（LangChain 序列化格式），
  // 通过 id 路径推断类型：["langchain_core","messages","SystemMessage"] -> "system"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (m as any).id;
  if (Array.isArray(id) && typeof id[2] === "string") {
    return id[2].replace(/Message$/, "").toLowerCase();
  }
  return "";
}
