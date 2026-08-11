import { z } from "zod";
import type { ToolServices, PostAdminItem } from "./types";
import { createTool, success, error } from "./helper";

interface PostSummary {
  id: string; title: string; status: string;
  categoryName: string | null; tags: string[]; views: number;
  isTop: boolean; createdAt: Date;
}

function toPostSummary(p: PostAdminItem): PostSummary {
  const tagArr = typeof p.tags === "string"
    ? p.tags.split(", ").filter(Boolean)
    : [];
  return {
    id: p.id,
    title: p.title,
    status: p.status,
    categoryName: p.category ?? null,
    tags: tagArr,
    views: p.views ?? 0,
    isTop: p.isTop,
    createdAt: p.createdAt,
  };
}

export function createSearchPostsTool(svc: ToolServices) {
  return createTool("search_posts",
    "搜索文章列表。支持按关键词、状态、分类ID、标签ID、时间范围筛选。返回分页结果。",
    z.object({
      keyword: z.string().optional().describe("搜索关键词"),
      status: z.enum(["published", "draft", "all"]).optional().default("all"),
      categoryId: z.number().optional().describe("分类ID"),
      tagId: z.number().optional().describe("标签ID"),
      startDate: z.string().optional().describe("开始日期 YYYY-MM-DD"),
      endDate: z.string().optional().describe("结束日期 YYYY-MM-DD"),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(10),
    }),
    async (args) => {
      const result = await svc.postService.findPage(args);
      return JSON.stringify({
        items: result.items.map(toPostSummary),
        total: result.meta.total,
        page: args.page,
        limit: args.limit,
      });
    });
}

export function createGetPostTool(svc: ToolServices) {
  return createTool("get_post",
    "获取单篇文章的完整内容，包括标题、正文、分类、标签、摘要、封面图等所有字段。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => {
      const post = await svc.postService.findOne(args.id);
      return post ? JSON.stringify(post) : error("文章不存在");
    });
}

export function createCreatePostTool(svc: ToolServices) {
  return createTool("create_post", "创建新文章（草稿）。需要标题、内容、分类ID。",
    z.object({
      title: z.string().describe("标题"),
      content: z.string().describe("内容"),
      categoryId: z.number().describe("分类ID"),
      summary: z.string().optional().describe("摘要"),
      coverImage: z.string().optional().describe("封面图URL"),
      tagIds: z.array(z.number()).optional().describe("标签ID列表"),
      publishTime: z.string().optional().describe("发布时间"),
    }),
    async (args) => {
      const post = await svc.postService.create(args) as Record<string, unknown>;
      return success("文章创建成功", { id: post.id });
    });
}

export function createUpdatePostTool(svc: ToolServices) {
  return createTool("update_post", "更新文章。只需提供要更新的字段。",
    z.object({
      id: z.number().describe("文章ID"),
      title: z.string().optional().describe("标题"),
      content: z.string().optional().describe("内容"),
      categoryId: z.number().optional().describe("分类ID"),
      summary: z.string().optional().describe("摘要"),
      coverImage: z.string().optional().describe("封面图URL"),
      tagIds: z.array(z.number()).optional().describe("标签ID列表"),
      status: z.enum(["draft", "published", "archived"]).optional().describe("状态"),
      publishTime: z.string().optional().describe("发布时间"),
    }),
    async (args) => {
      const { id, ...data } = args;
      await svc.postService.update(id, data as Record<string, unknown>);
      return success("文章更新成功");
    });
}

export function createDeletePostTool(svc: ToolServices) {
  return createTool("delete_post", "删除文章。此操作不可恢复。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.delete(args.id); return success("文章已删除"); });
}

export function createPublishPostTool(svc: ToolServices) {
  return createTool("publish_post", "发布文章（草稿→已发布）。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.publish(args.id); return success("文章已发布"); });
}

export function createUnpublishPostTool(svc: ToolServices) {
  return createTool("unpublish_post", "下架文章（已发布→草稿）。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.unpublish(args.id); return success("文章已下架"); });
}

export function createTopPostTool(svc: ToolServices) {
  return createTool("top_post", "置顶文章。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.top(args.id); return success("文章已置顶"); });
}

export function createUntopPostTool(svc: ToolServices) {
  return createTool("untop_post", "取消置顶文章。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.untop(args.id); return success("已取消置顶"); });
}
