import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success, error } from "./helper";

export function createGetCategoriesTool(svc: ToolServices) {
  return createTool("get_categories", "获取所有分类列表，包含分类名称、文章数量等信息。",
    z.object({}),
    () => svc.categoryService.findAll().then(JSON.stringify));
}

export function createCreateCategoryTool(svc: ToolServices) {
  return createTool("create_category", "创建新分类。",
    z.object({ name: z.string().describe("分类名称"), description: z.string().optional().describe("分类描述") }),
    async (args) => {
      const cat = await svc.categoryService.create(args);
      return success(`分类「${cat.name}」创建成功`, { category: cat });
    });
}

export function createUpdateCategoryTool(svc: ToolServices) {
  return createTool("update_category", "修改分类名称或描述。",
    z.object({ id: z.number().describe("分类ID"), name: z.string().optional().describe("新名称"), description: z.string().optional().describe("新描述") }),
    async (args) => {
      const { id, ...data } = args;
      await svc.categoryService.update(id, data);
      return success(`分类 #${id} 已更新`);
    });
}

export function createDeleteCategoryTool(svc: ToolServices) {
  return createTool("delete_category", "删除分类。若分类下有文章则无法删除。",
    z.object({ id: z.number().describe("分类ID") }),
    async (args) => {
      try { await svc.categoryService.delete(args.id); return success(`分类 #${args.id} 已删除`); }
      catch (e: unknown) { return error((e as Error).message); }
    });
}