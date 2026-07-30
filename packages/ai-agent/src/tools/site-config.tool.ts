import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

export function createGetSiteConfigTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_site_config";
    description = "查看站点配置，包括站点名称、描述、Logo、favicon 等。";
    schema = z.object({});
    async _call() {
      const config = await services.siteConfigService.get();
      return JSON.stringify(config);
    }
  })();
}

export function createUpdateSiteConfigTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_site_config";
    description = "修改站点配置，可更新站点名称、描述、Logo、favicon 等。";
    schema = z.object({
      siteName: z.string().optional().describe("站点名称"),
      siteDescription: z.string().optional().describe("站点描述"),
      logo: z.string().optional().describe("Logo URL"),
      favicon: z.string().optional().describe("Favicon URL"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.siteConfigService.update(args);
      return JSON.stringify({ success: true, message: "站点配置已更新" });
    }
  })();
}

export function createGetSeoSettingsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_seo_settings";
    description = "查看 SEO 设置，包括全局 title、description、keywords 等。";
    schema = z.object({});
    async _call() {
      const settings = await services.seoSettingService.getLatest();
      return JSON.stringify(settings);
    }
  })();
}

export function createUpdateSeoSettingsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_seo_settings";
    description = "修改 SEO 设置。";
    schema = z.object({
      title: z.string().optional().describe("全局 SEO 标题"),
      description: z.string().optional().describe("全局 SEO 描述"),
      keywords: z.string().optional().describe("全局 SEO 关键词"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.seoSettingService.create(args);
      return JSON.stringify({ success: true, message: "SEO 设置已更新" });
    }
  })();
}

export function createGetIcpInfoTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_icp_info";
    description = "查看 ICP 备案信息。";
    schema = z.object({});
    async _call() {
      const info = await services.icpInfoService.getLatest();
      return JSON.stringify(info);
    }
  })();
}

export function createUpdateIcpInfoTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_icp_info";
    description = "修改 ICP 备案信息。";
    schema = z.object({
      icpNumber: z.string().optional().describe("ICP 备案号"),
      policeNumber: z.string().optional().describe("公安备案号"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.icpInfoService.create(args);
      return JSON.stringify({ success: true, message: "ICP 备案信息已更新" });
    }
  })();
}

export function createGetSettingTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_setting";
    description = "查看全局设置。";
    schema = z.object({});
    async _call() {
      const setting = await services.settingService.get();
      return JSON.stringify(setting);
    }
  })();
}

export function createUpdateSettingTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_setting";
    description = "修改全局设置。";
    schema = z.object({
      key: z.string().describe("设置键"),
      value: z.string().describe("设置值"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      await services.settingService.update(args.key, args.value);
      return JSON.stringify({ success: true, message: `设置 ${args.key} 已更新` });
    }
  })();
}