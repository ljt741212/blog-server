import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

// ---- get_tags ----
export function createGetTagsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_tags";
    description = "获取所有标签列表，包含标签名称、文章数量等信息。";
    schema = z.object({});
    async _call() {
      const list = await services.tagService.findAll();
      return JSON.stringify(list);
    }
  })();
}

// ---- create_tag ----
export function createCreateTagTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "create_tag";
    description = "创建新标签。";
    schema = z.object({
      name: z.string().describe("标签名称"),
      color: z.string().optional().describe("标签颜色，如 #3b82f6"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const tag = await services.tagService.create(args);
      return JSON.stringify({ success: true, tag, message: `标签「${tag.name}」创建成功` });
    }
  })();
}

// ---- update_tag ----
export function createUpdateTagTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_tag";
    description = "修改标签名称或颜色。";
    schema = z.object({
      id: z.number().describe("标签ID"),
      name: z.string().optional().describe("新名称"),
      color: z.string().optional().describe("新颜色"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const { id, ...data } = args;
      await services.tagService.update(id, data);
      return JSON.stringify({ success: true, message: `标签 #${id} 已更新` });
    }
  })();
}

// ---- delete_tag ----
export function createDeleteTagTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_tag";
    description = "删除标签。";
    schema = z.object({ id: z.number().describe("标签ID") });
    async _call(args: z.infer<typeof this.schema>) {
      try {
        await services.tagService.delete(args.id);
        return JSON.stringify({ success: true, message: `标签 #${args.id} 已删除` });
      } catch (e: any) {
        return JSON.stringify({ error: true, message: e.message });
      }
    }
  })();
}