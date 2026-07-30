import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createExportDataTool(svc: ToolServices) {
  return createTool("export_data", "导出博客数据，包括文章、分类、标签、评论等。",
    z.object({}),
    async () => { const result = await svc.dataTransferService.export(); return success("数据导出成功", { data: result as Record<string, unknown> }); });
}

export function createImportDataTool(svc: ToolServices) {
  return createTool("import_data", "导入博客数据，将覆盖现有数据。",
    z.object({ data: z.string().describe("要导入的 JSON 数据") }),
    async (args) => { await svc.dataTransferService.import(args.data); return success("数据导入成功"); });
}