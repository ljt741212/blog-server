import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import type { ToolServices } from "./types.js";

function mapPost(p: Record<string, unknown>) {
  return {
    id: p.id, title: p.title, status: p.status,
    categoryName: (p.category as any)?.name ?? null,
    tags: (p.tags as any[])?.map((t: any) => t.name) ?? [],
    isTop: p.isTop, createdAt: p.createdAt,
  };
}

// ---- search_posts ----
export function createSearchPostsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "search_posts";
    description = "搜索文章列表。支持按关键词、状态、分类ID、标签ID、时间范围筛选。返回分页结果，每篇文章包含 id、标题、状态、分类名、标签名、创建时间。";
    schema = z.object({
      keyword: z.string().optional().describe("搜索关键词，匹配标题和内容"),
      status: z.enum(["published", "draft", "all"]).optional().default("all"),
      categoryId: z.number().optional().describe("分类ID"),
      tagId: z.number().optional().describe("标签ID"),
      startDate: z.string().optional().describe("开始日期 YYYY-MM-DD"),
      endDate: z.string().optional().describe("结束日期 YYYY-MM-DD"),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(10),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const result = await services.postService.findPage({
        keyword: args.keyword, status: args.status,
        categoryId: args.categoryId, tagId: args.tagId,
        startDate: args.startDate, endDate: args.endDate,
        page: args.page, limit: args.limit,
      });
      return JSON.stringify({
        items: result.items.map(mapPost),
        total: result.total,
        page: args.page, limit: args.limit,
      });
    }
  })();
}

// ---- get_post ----
export function createGetPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "get_post";
    description = "获取单篇文章的完整内容，包括标题、正文、分类、标签、摘要、封面图等所有字段。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      const post = await services.postService.findOne(args.id);
      if (!post) return JSON.stringify({ error: "文章不存在" });
      return JSON.stringify(post);
    }
  })();
}

// ---- create_post ----
export function createCreatePostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "create_post";
    description = "创建新文章，可指定标题、正文、分类ID、标签ID列表、摘要、封面图URL。";
    schema = z.object({
      title: z.string().describe("文章标题"),
      content: z.string().describe("文章正文（Markdown）"),
      categoryId: z.number().optional().describe("分类ID"),
      tagIds: z.array(z.number()).optional().describe("标签ID列表"),
      summary: z.string().optional().describe("文章摘要"),
      coverUrl: z.string().optional().describe("封面图URL"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const post = await services.postService.create(args);
      return JSON.stringify({ success: true, post: mapPost(post), message: `文章《${post.title}》创建成功` });
    }
  })();
}

// ---- update_post ----
export function createUpdatePostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "update_post";
    description = "修改已有文章，只需传入要修改的字段。";
    schema = z.object({
      id: z.number().describe("文章ID"),
      title: z.string().optional().describe("新标题"),
      content: z.string().optional().describe("新正文"),
      categoryId: z.number().optional().describe("新分类ID"),
      tagIds: z.array(z.number()).optional().describe("新标签ID列表"),
      summary: z.string().optional().describe("新摘要"),
      coverUrl: z.string().optional().describe("新封面图URL"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const { id, ...data } = args;
      await services.postService.update(id, data);
      return JSON.stringify({ success: true, message: `文章 #${id} 已更新` });
    }
  })();
}

// ---- delete_post ----
export function createDeletePostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "delete_post";
    description = "永久删除文章，不可恢复。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      const post = await services.postService.findOne(args.id);
      if (!post) return JSON.stringify({ error: "文章不存在" });
      await services.postService.delete(args.id);
      return JSON.stringify({ success: true, message: `已删除文章《${post.title}》` });
    }
  })();
}

// ---- publish_post ----
export function createPublishPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "publish_post";
    description = "发布文章（将草稿状态改为已发布）。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.postService.publish(args.id);
      return JSON.stringify({ success: true, message: `文章 #${args.id} 已发布` });
    }
  })();
}

// ---- unpublish_post ----
export function createUnpublishPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "unpublish_post";
    description = "下架文章（将已发布状态改为草稿）。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.postService.unpublish(args.id);
      return JSON.stringify({ success: true, message: `文章 #${args.id} 已下架` });
    }
  })();
}

// ---- top_post ----
export function createTopPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "top_post";
    description = "置顶文章。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.postService.top(args.id);
      return JSON.stringify({ success: true, message: `文章 #${args.id} 已置顶` });
    }
  })();
}

// ---- untop_post ----
export function createUntopPostTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "untop_post";
    description = "取消文章置顶。";
    schema = z.object({ id: z.number().describe("文章ID") });
    async _call(args: z.infer<typeof this.schema>) {
      await services.postService.untop(args.id);
      return JSON.stringify({ success: true, message: `文章 #${args.id} 已取消置顶` });
    }
  })();
}