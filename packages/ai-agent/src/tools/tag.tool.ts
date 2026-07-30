import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success, error } from "./helper";

export function createGetTagsTool(svc: ToolServices) {
  return createTool("get_tags", "获取所有标签列表。",
    z.object({}),
    () => svc.tagService.findAll().then(JSON.stringify));
}

export function createCreateTagTool(svc: ToolServices) {
  return createTool("create_tag", "创建新标签。",
    z.object({ name: z.string().describe("标签名称"), color: z.string().optional().describe("标签颜色，如 #3b82f6") }),
    async (args) => {
      const tag = await svc.tagService.create(args);
      return success(`标签「${tag.name}」创建成功`, { tag });
    });
}

export function createUpdateTagTool(svc: ToolServices) {
  return createTool("update_tag", "修改标签名称或颜色。",
    z.object({ id: z.number().describe("标签ID"), name: z.string().optional().describe("新名称"), color: z.string().optional().describe("新颜色") }),
    async (args) => {
      const { id, ...data } = args;
      await svc.tagService.update(id, data);
      return success(`标签 #${id} 已更新`);
    });
}

export function createDeleteTagTool(svc: ToolServices) {
  return createTool("delete_tag", "删除标签。",
    z.object({ id: z.number().describe("标签ID") }),
    async (args) => {
      try { await svc.tagService.delete(args.id); return success(`标签 #${args.id} 已删除`); }
      catch (e: unknown) { return error((e as Error).message); }
    });
}