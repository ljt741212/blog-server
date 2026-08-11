import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetFriendLinksTool(svc: ToolServices) {
  return createTool("get_friend_links", "查看友链列表，可按状态筛选。",
    z.object({ status: z.enum(["pending", "approved", "rejected", "all"]).optional().default("all") }),
    (args) => svc.friendLinkService.findAll(args.status).then(JSON.stringify));
}

export function createApproveFriendLinkTool(svc: ToolServices) {
  return createTool("approve_friend_link", "审核通过友链申请。",
    z.object({ id: z.number().describe("友链ID") }),
    async (args) => { await svc.friendLinkService.approve(args.id); return success(`友链 #${args.id} 已通过`); });
}

export function createRejectFriendLinkTool(svc: ToolServices) {
  return createTool("reject_friend_link", "拒绝友链申请。",
    z.object({ id: z.number().describe("友链ID") }),
    async (args) => { await svc.friendLinkService.reject(args.id); return success(`友链 #${args.id} 已拒绝`); });
}

export function createDeleteFriendLinkTool(svc: ToolServices) {
  return createTool("delete_friend_link", "删除友链。",
    z.object({ id: z.number().describe("友链ID") }),
    async (args) => { await svc.friendLinkService.delete(args.id); return success(`友链 #${args.id} 已删除`); });
}