import { z } from "zod";
import { ToolServices } from "./types";
import { createTool } from "./helper";

export function createGetOssSignUrlTool(svc: ToolServices) {
  return createTool("get_oss_sign_url", "获取 OSS 文件的签名访问 URL。",
    z.object({
      key: z.string().describe("OSS 文件 key（路径）"),
      expiresIn: z.number().optional().default(3600).describe("过期时间（秒），默认 3600"),
    }),
    async (args) => {
      const url = svc.ossService.signUrl(args.key);
      return JSON.stringify({ url, expiresIn: args.expiresIn });
    });
}