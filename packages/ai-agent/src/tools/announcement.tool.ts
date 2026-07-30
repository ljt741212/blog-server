import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

export function createGetAnnouncementsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_announcements";
    description = "查看公告列表，支持分页。";
    schema = z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.announcementService.findPage({ page: args.page, limit: args.limit });
      return JSON.stringify(result);
    }
  })();
}

export function createCreateAnnouncementTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "create_announcement";
    description = "发布新公告。";
    schema = z.object({
      title: z.string().describe("公告标题"),
      content: z.string().describe("公告内容"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const ann = await services.announcementService.create(args);
      return JSON.stringify({ success: true, announcement: ann, message: `公告「${ann.title}」发布成功` });
    }
  })();
}

export function createDeleteAnnouncementTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_announcement";
    description = "删除公告。";
    schema = z.object({ id: z.number().describe("公告ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.announcementService.delete(args.id);
      return JSON.stringify({ success: true, message: `公告 #${args.id} 已删除` });
    }
  })();
}