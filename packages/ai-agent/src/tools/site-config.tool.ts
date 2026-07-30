import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success } from "./helper";

export function createGetSiteConfigTool(svc: ToolServices) {
  return createTool("get_site_config", "查看站点配置，包括站点名称、描述、Logo、favicon 等。",
    z.object({}),
    () => svc.siteConfigService.get().then(JSON.stringify));
}

export function createUpdateSiteConfigTool(svc: ToolServices) {
  return createTool("update_site_config", "修改站点配置，可更新站点名称、描述、Logo、favicon 等。",
    z.object({
      siteName: z.string().optional().describe("站点名称"),
      siteDescription: z.string().optional().describe("站点描述"),
      logo: z.string().optional().describe("Logo URL"),
      favicon: z.string().optional().describe("Favicon URL"),
    }),
    async (args) => { await svc.siteConfigService.update(args); return success("站点配置已更新"); });
}

export function createGetSeoSettingsTool(svc: ToolServices) {
  return createTool("get_seo_settings", "查看 SEO 设置。",
    z.object({}),
    () => svc.seoSettingService.getLatest().then(JSON.stringify));
}

export function createUpdateSeoSettingsTool(svc: ToolServices) {
  return createTool("update_seo_settings", "修改 SEO 设置。",
    z.object({
      title: z.string().optional().describe("全局 SEO 标题"),
      description: z.string().optional().describe("全局 SEO 描述"),
      keywords: z.string().optional().describe("全局 SEO 关键词"),
    }),
    async (args) => { await svc.seoSettingService.create(args); return success("SEO 设置已更新"); });
}

export function createGetIcpInfoTool(svc: ToolServices) {
  return createTool("get_icp_info", "查看 ICP 备案信息。",
    z.object({}),
    () => svc.icpInfoService.getLatest().then(JSON.stringify));
}

export function createUpdateIcpInfoTool(svc: ToolServices) {
  return createTool("update_icp_info", "修改 ICP 备案信息。",
    z.object({
      icpNumber: z.string().optional().describe("ICP 备案号"),
      policeNumber: z.string().optional().describe("公安备案号"),
    }),
    async (args) => { await svc.icpInfoService.create(args); return success("ICP 备案信息已更新"); });
}

export function createGetSettingTool(svc: ToolServices) {
  return createTool("get_setting", "查看全局设置。",
    z.object({}),
    () => svc.settingService.getAll().then(JSON.stringify));
}

export function createUpdateSettingTool(svc: ToolServices) {
  return createTool("update_setting", "修改全局设置。",
    z.object({ key: z.string().describe("设置键"), value: z.string().describe("设置值") }),
    async (args) => { await svc.settingService.save({ [args.key]: args.value }); return success(`设置 ${args.key} 已更新`); });
}