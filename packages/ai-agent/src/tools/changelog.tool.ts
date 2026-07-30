import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

export function createGetChangelogsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_changelogs";
    description = "查看更新日志列表，支持分页。";
    schema = z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.changelogService.findPage({ page: args.page, limit: args.limit });
      return JSON.stringify(result);
    }
  })();
}

export function createCreateChangelogTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "create_changelog";
    description = "发布新更新日志。";
    schema = z.object({
      title: z.string().describe("更新标题"),
      content: z.string().describe("更新内容"),
      version: z.string().optional().describe("版本号"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const log = await services.changelogService.create(args);
      return JSON.stringify({ success: true, changelog: log, message: `更新日志「${log.title}」发布成功` });
    }
  })();
}

export function createDeleteChangelogTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_changelog";
    description = "删除更新日志。";
    schema = z.object({ id: z.number().describe("更新日志ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.changelogService.delete(args.id);
      return JSON.stringify({ success: true, message: `更新日志 #${args.id} 已删除` });
    }
  })();
}