import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types";

export function createGetOssSignUrlTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_oss_sign_url";
    description = "获取 OSS 文件的签名访问 URL。";
    schema = z.object({
      key: z.string().describe("OSS 文件 key（路径）"),
      expiresIn: z.number().optional().default(3600).describe("过期时间（秒），默认 3600"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const url = await services.ossService.getSignUrl(args.key, args.expiresIn);
      return JSON.stringify({ url, expiresIn: args.expiresIn });
    }
  })();
}