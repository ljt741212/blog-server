import type { BaseMessage } from "@langchain/core/messages";

/** Extract the message type string from a LangChain BaseMessage. */
export function getMsgType(m: BaseMessage): string {
  return m._getType?.() ?? m.getType?.() ?? "";
}
