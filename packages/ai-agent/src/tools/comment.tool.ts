import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetCommentsTool(svc: ToolServices) {
  return createTool("get_comments", "查询评论列表。支持按文章ID、状态筛选。",
    z.object({
      postId: z.number().optional().describe("文章ID"),
      status: z.enum(["pending", "approved", "rejected", "all"]).optional().default("all"),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    }),
    (args) => svc.commentService.findPage(args).then(JSON.stringify));
}

export function createApproveCommentTool(svc: ToolServices) {
  return createTool("approve_comment", "审核通过评论。",
    z.object({ id: z.number().describe("评论ID") }),
    async (args) => { await svc.commentService.approve(args.id); return success(`评论 #${args.id} 已通过`); });
}

export function createRejectCommentTool(svc: ToolServices) {
  return createTool("reject_comment", "拒绝评论。",
    z.object({ id: z.number().describe("评论ID") }),
    async (args) => { await svc.commentService.reject(args.id); return success(`评论 #${args.id} 已拒绝`); });
}

export function createReplyCommentTool(svc: ToolServices) {
  return createTool("reply_comment", "回复评论。",
    z.object({ id: z.number().describe("要回复的评论ID"), content: z.string().describe("回复内容") }),
    async (args) => { await svc.commentService.reply(args.id, args.content); return success(`已回复评论 #${args.id}`); });
}

export function createDeleteCommentTool(svc: ToolServices) {
  return createTool("delete_comment", "删除评论。",
    z.object({ id: z.number().describe("评论ID") }),
    async (args) => { await svc.commentService.delete(args.id); return success(`评论 #${args.id} 已删除`); });
}