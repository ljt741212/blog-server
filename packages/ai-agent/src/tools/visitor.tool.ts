import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetVisitorDashboardTool(svc: ToolServices) {
  return createTool("get_visitor_dashboard", "查看访问仪表盘数据，包括 PV、UV、今日访问量、趋势图数据等。",
    z.object({}),
    () => svc.visitorService.getDashboardStats().then(JSON.stringify));
}

export function createGetVisitorLogsTool(svc: ToolServices) {
  return createTool("get_visitor_logs", "查看访问记录，支持分页。",
    z.object({ page: z.number().optional().default(1), limit: z.number().optional().default(20) }),
    (args) => svc.visitorService.paginateForAdmin(args).then(JSON.stringify));
}

export function createGetOnlineVisitorsTool(svc: ToolServices) {
  return createTool("get_online_visitors", "查看当前在线访客人数。",
    z.object({}),
    async () => JSON.stringify({ onlineCount: await svc.visitorService.getOnlineStats() }));
}