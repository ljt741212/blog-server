import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

export function createExportDataTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "export_data";
    description = "导出博客数据，包括文章、分类、标签、评论等。";
    schema = z.object({});
    async _call() {
      const result = await services.dataTransferService.export();
      return JSON.stringify({ success: true, data: result, message: "数据导出成功" });
    }
  })();
}

export function createImportDataTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "import_data";
    description = "导入博客数据，将覆盖现有数据。";
    schema = z.object({
      data: z.string().describe("要导入的 JSON 数据"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.dataTransferService.import(args.data);
      return JSON.stringify({ success: true, message: "数据导入成功" });
    }
  })();
}