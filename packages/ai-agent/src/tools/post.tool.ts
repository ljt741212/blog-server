import { z } from "zod";
import { ToolServices } from "./types";
import { createTool, success, error } from "./helper";

function mapPost(p: Record<string, unknown>) {
  return {
    id: p.id, title: p.title, status: p.status,
    categoryName: (p.category as Record<string, unknown>)?.name ?? null,
    tags: Array.isArray(p.tags) ? (p.tags as Record<string, unknown>[]).map((t) => t.name) : [],
    views: p.views ?? 0,
    isTop: p.isTop, createdAt: p.createdAt,
  };
}

export function createSearchPostsTool(svc: ToolServices) {
  return createTool("search_posts", "搜索文章列表。支持按关键词、状态、分类ID、标签ID、时间范围筛选。返回分页结果，每篇文章包含 id、标题、状态、分类名、标签名、创建时间、浏览量。",
    z.object({
      keyword: z.string().optional().describe("搜索关键词，匹配标题和内容"),
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
      return JSON.stringify({ items: result.items.map(mapPost), total: result.total, page: args.page, limit: args.limit });
    });
}

export function createGetPostTool(svc: ToolServices) {
  return createTool("get_post", "获取单篇文章的完整内容，包括标题、正文、分类、标签、摘要、封面图等所有字段。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => {
      const post = await svc.postService.findOne(args.id);
      return post ? JSON.stringify(post) : error("文章不存在");
    });
}

export function createCreatePostTool(svc: ToolServices) {
  return createTool("create_post", "创建新文章，可指定标题、正文、分类ID、标签ID列表、摘要、封面图URL。",
    z.object({
      title: z.string().describe("文章标题"),
      content: z.string().describe("文章正文（Markdown）"),
      categoryId: z.number().optional().describe("分类ID"),
      tagIds: z.array(z.number()).optional().describe("标签ID列表"),
      summary: z.string().optional().describe("文章摘要"),
      coverUrl: z.string().optional().describe("封面图URL"),
    }),
    async (args) => {
      const post = await svc.postService.create(args);
      return success(`文章《${post.title}》创建成功`, { post: mapPost(post) });
    });
}

export function createUpdatePostTool(svc: ToolServices) {
  return createTool("update_post", "修改已有文章，只需传入要修改的字段。",
    z.object({
      id: z.number().describe("文章ID"),
      title: z.string().optional().describe("新标题"),
      content: z.string().optional().describe("新正文"),
      categoryId: z.number().optional().describe("新分类ID"),
      tagIds: z.array(z.number()).optional().describe("新标签ID列表"),
      summary: z.string().optional().describe("新摘要"),
      coverUrl: z.string().optional().describe("新封面图URL"),
    }),
    async (args) => {
      const { id, ...data } = args;
      await svc.postService.update(id, data);
      return success(`文章 #${id} 已更新`);
    });
}

export function createDeletePostTool(svc: ToolServices) {
  return createTool("delete_post", "永久删除文章，不可恢复。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => {
      const post = await svc.postService.findOne(args.id);
      if (!post) return error("文章不存在");
      await svc.postService.delete(args.id);
      return success(`已删除文章《${post.title}》`);
    });
}

export function createPublishPostTool(svc: ToolServices) {
  return createTool("publish_post", "发布文章（将草稿状态改为已发布）。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.publish(args.id); return success(`文章 #${args.id} 已发布`); });
}

export function createUnpublishPostTool(svc: ToolServices) {
  return createTool("unpublish_post", "下架文章（将已发布状态改为草稿）。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.unpublish(args.id); return success(`文章 #${args.id} 已下架`); });
}

export function createTopPostTool(svc: ToolServices) {
  return createTool("top_post", "置顶文章。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.top(args.id); return success(`文章 #${args.id} 已置顶`); });
}

export function createUntopPostTool(svc: ToolServices) {
  return createTool("untop_post", "取消文章置顶。",
    z.object({ id: z.number().describe("文章ID") }),
    async (args) => { await svc.postService.untop(args.id); return success(`文章 #${args.id} 已取消置顶`); });
}