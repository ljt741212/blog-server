import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetAnnouncementsTool(svc: ToolServices) {
  return createTool("get_announcements", "查看公告列表，支持分页。",
    z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20) }),
    (args) => svc.announcementService.findPage(args).then(JSON.stringify));
}

export function createCreateAnnouncementTool(svc: ToolServices) {
  return createTool("create_announcement", "发布新公告。",
    z.object({ title: z.string().describe("公告标题"), content: z.string().describe("公告内容") }),
    async (args) => {
      const ann = await svc.announcementService.create(args);
      return success(`公告「${ann.title}」发布成功`, { announcement: ann });
    });
}

export function createDeleteAnnouncementTool(svc: ToolServices) {
  return createTool("delete_announcement", "删除公告。",
    z.object({ id: z.number().describe("公告ID") }),
    async (args) => { await svc.announcementService.delete(args.id); return success(`公告 #${args.id} 已删除`); });
}