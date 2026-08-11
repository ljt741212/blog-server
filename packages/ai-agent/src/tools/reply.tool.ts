import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { createTool } from "./helper";
import type { EditorToolServices } from "./types";

export function createReplyTool(_svc: EditorToolServices): StructuredTool {
  return createTool(
    "reply_to_user",
    "当不需要执行写作操作、只需和用户对话时（如回复问候、确认操作、解释结果），调用此工具返回对话内容。",
    z.object({
      message: z.string().describe("要回复给用户的对话内容"),
    }),
    async (args) => {
      return JSON.stringify({ message: args.message, fills: [] });
    },
  );
}
