import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

// ---- get_categories ----
export function createGetCategoriesTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_categories";
    description = "获取所有分类列表，包含分类名称、文章数量等信息。";
    schema = z.object({});
    async _call() {
      const list = await services.categoryService.findAll();
      return JSON.stringify(list);
    }
  })();
}

// ---- create_category ----
export function createCreateCategoryTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "create_category";
    description = "创建新分类。";
    schema = z.object({
      name: z.string().describe("分类名称"),
      description: z.string().optional().describe("分类描述"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const cat = await services.categoryService.create(args);
      return JSON.stringify({ success: true, category: cat, message: `分类「${cat.name}」创建成功` });
    }
  })();
}

// ---- update_category ----
export function createUpdateCategoryTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_category";
    description = "修改分类名称或描述。";
    schema = z.object({
      id: z.number().describe("分类ID"),
      name: z.string().optional().describe("新名称"),
      description: z.string().optional().describe("新描述"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const { id, ...data } = args;
      await services.categoryService.update(id, data);
      return JSON.stringify({ success: true, message: `分类 #${id} 已更新` });
    }
  })();
}

// ---- delete_category ----
export function createDeleteCategoryTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_category";
    description = "删除分类。若分类下有文章则无法删除。";
    schema = z.object({ id: z.number().describe("分类ID") });
    async _call(args: z.infer<typeof this.schema>) {
      try {
        await services.categoryService.delete(args.id);
        return JSON.stringify({ success: true, message: `分类 #${args.id} 已删除` });
      } catch (e: any) {
        return JSON.stringify({ error: true, message: e.message });
      }
    }
  })();
}