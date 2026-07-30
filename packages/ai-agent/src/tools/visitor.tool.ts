import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

export function createGetVisitorDashboardTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_visitor_dashboard";
    description = "查看访问仪表盘数据，包括 PV、UV、今日访问量、趋势图数据等。";
    schema = z.object({});
    async _call() {
      const data = await services.visitorService.getDashboard();
      return JSON.stringify(data);
    }
  })();
}

export function createGetVisitorLogsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_visitor_logs";
    description = "查看访问记录，支持分页。";
    schema = z.object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.visitorService.findPage({ page: args.page, limit: args.limit });
      return JSON.stringify(result);
    }
  })();
}

export function createGetOnlineVisitorsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_online_visitors";
    description = "查看当前在线访客人数。";
    schema = z.object({});
    async _call() {
      const count = await services.visitorService.getOnlineCount();
      return JSON.stringify({ onlineCount: count });
    }
  })();
}