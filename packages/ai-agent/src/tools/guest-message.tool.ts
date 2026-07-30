import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetGuestMessagesTool(svc: ToolServices) {
  return createTool("get_guest_messages", "查看留言列表，支持分页。",
    z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20) }),
    (args) => svc.guestMessageService.findPage(args).then(JSON.stringify));
}

export function createReplyGuestMessageTool(svc: ToolServices) {
  return createTool("reply_guest_message", "回复留言。",
    z.object({ id: z.number().describe("留言ID"), content: z.string().describe("回复内容") }),
    async (args) => { await svc.guestMessageService.reply(args.id, args.content); return success(`已回复留言 #${args.id}`); });
}

export function createDeleteGuestMessageTool(svc: ToolServices) {
  return createTool("delete_guest_message", "删除留言。",
    z.object({ id: z.number().describe("留言ID") }),
    async (args) => { await svc.guestMessageService.delete(args.id); return success(`留言 #${args.id} 已删除`); });
}