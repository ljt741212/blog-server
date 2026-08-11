import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetChangelogsTool(svc: ToolServices) {
  return createTool("get_changelogs", "查看更新日志列表，支持分页。",
    z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20) }),
    (args) => svc.changelogService.findPage(args).then(JSON.stringify));
}

export function createCreateChangelogTool(svc: ToolServices) {
  return createTool("create_changelog", "发布新更新日志。",
    z.object({ title: z.string().describe("更新标题"), content: z.string().describe("更新内容"), version: z.string().optional().describe("版本号") }),
    async (args) => {
      const log = await svc.changelogService.create(args);
      return success(`更新日志「${log.title}」发布成功`, { changelog: log });
    });
}

export function createDeleteChangelogTool(svc: ToolServices) {
  return createTool("delete_changelog", "删除更新日志。",
    z.object({ id: z.number().describe("更新日志ID") }),
    async (args) => { await svc.changelogService.delete(args.id); return success(`更新日志 #${args.id} 已删除`); });
}