import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

export function createGetFriendLinksTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_friend_links";
    description = "查看友链列表，可按状态筛选。";
    schema = z.object({
      status: z.enum(["pending", "approved", "rejected", "all"]).optional().default("all"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const list = await services.friendLinkService.findAll(args.status);
      return JSON.stringify(list);
    }
  })();
}

export function createApproveFriendLinkTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "approve_friend_link";
    description = "审核通过友链申请。";
    schema = z.object({ id: z.number().describe("友链ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.friendLinkService.approve(args.id);
      return JSON.stringify({ success: true, message: `友链 #${args.id} 已通过` });
    }
  })();
}

export function createRejectFriendLinkTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "reject_friend_link";
    description = "拒绝友链申请。";
    schema = z.object({ id: z.number().describe("友链ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.friendLinkService.reject(args.id);
      return JSON.stringify({ success: true, message: `友链 #${args.id} 已拒绝` });
    }
  })();
}

export function createDeleteFriendLinkTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_friend_link";
    description = "删除友链。";
    schema = z.object({ id: z.number().describe("友链ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.friendLinkService.delete(args.id);
      return JSON.stringify({ success: true, message: `友链 #${args.id} 已删除` });
    }
  })();
}