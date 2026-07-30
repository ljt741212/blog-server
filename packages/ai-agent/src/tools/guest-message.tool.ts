import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

export function createGetGuestMessagesTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_guest_messages";
    description = "查看留言列表，支持分页。";
    schema = z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.guestMessageService.findPage({ page: args.page, limit: args.limit });
      return JSON.stringify(result);
    }
  })();
}

export function createReplyGuestMessageTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "reply_guest_message";
    description = "回复留言。";
    schema = z.object({
      id: z.number().describe("留言ID"),
      content: z.string().describe("回复内容"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.guestMessageService.reply(args.id, args.content);
      return JSON.stringify({ success: true, message: `已回复留言 #${args.id}` });
    }
  })();
}

export function createDeleteGuestMessageTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_guest_message";
    description = "删除留言。";
    schema = z.object({ id: z.number().describe("留言ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.guestMessageService.delete(args.id);
      return JSON.stringify({ success: true, message: `留言 #${args.id} 已删除` });
    }
  })();
}