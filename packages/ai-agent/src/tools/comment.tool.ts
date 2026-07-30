import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

// ---- get_comments ----
export function createGetCommentsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_comments";
    description = "查询评论列表。支持按文章ID、状态、时间范围筛选。";
    schema = z.object({
      postId: z.number().optional().describe("文章ID"),
      status: z.enum(["pending", "approved", "rejected", "all"]).optional().default("all"),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.commentService.findPage({
        postId: args.postId, status: args.status,
        page: args.page, limit: args.limit,
      });
      return JSON.stringify(result);
    }
  })();
}

// ---- approve_comment ----
export function createApproveCommentTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "approve_comment";
    description = "审核通过评论。";
    schema = z.object({ id: z.number().describe("评论ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.commentService.approve(args.id);
      return JSON.stringify({ success: true, message: `评论 #${args.id} 已通过` });
    }
  })();
}

// ---- reject_comment ----
export function createRejectCommentTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "reject_comment";
    description = "拒绝评论。";
    schema = z.object({ id: z.number().describe("评论ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.commentService.reject(args.id);
      return JSON.stringify({ success: true, message: `评论 #${args.id} 已拒绝` });
    }
  })();
}

// ---- reply_comment ----
export function createReplyCommentTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "reply_comment";
    description = "回复评论。";
    schema = z.object({
      id: z.number().describe("要回复的评论ID"),
      content: z.string().describe("回复内容"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.commentService.reply(args.id, args.content);
      return JSON.stringify({ success: true, message: `已回复评论 #${args.id}` });
    }
  })();
}

// ---- delete_comment ----
export function createDeleteCommentTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_comment";
    description = "删除评论。";
    schema = z.object({ id: z.number().describe("评论ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.commentService.delete(args.id);
      return JSON.stringify({ success: true, message: `评论 #${args.id} 已删除` });
    }
  })();
}