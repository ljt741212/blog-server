import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";
import { createTool, success, error } from "./helper";
import type { ToolServices } from "./types";

// Redis-backed structured notes, matching hello-agents Ch9 NoteTool patterns.

interface NoteMeta {
  id: string;
  title: string;
  noteType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NoteDoc {
  content: string;
  metadata: NoteMeta;
}

function now(): string {
  return new Date().toISOString();
}

async function getIndex(svc: ToolServices, userId: string): Promise<NoteMeta[]> {
  const raw = await svc.redisService.get(`notes:${userId}:index`);
  if (!raw) return [];
  return JSON.parse(raw);
}

async function saveIndex(svc: ToolServices, userId: string, index: NoteMeta[]): Promise<void> {
  await svc.redisService.set(`notes:${userId}:index`, JSON.stringify(index), 86400 * 30);
}

async function getNote(svc: ToolServices, userId: string, noteId: string): Promise<NoteDoc | null> {
  const raw = await svc.redisService.get(`notes:${userId}:${noteId}`);
  if (!raw) return null;
  return JSON.parse(raw);
}

async function saveNote(svc: ToolServices, userId: string, doc: NoteDoc): Promise<void> {
  await svc.redisService.set(`notes:${userId}:${doc.metadata.id}`, JSON.stringify(doc), 86400 * 30);
}

// ---- Tool Factories ----

export function createNoteCreateTool(svc: ToolServices): StructuredTool {
  return createTool(
    "note_create",
    "创建一条结构化笔记。用于记录任务状态、结论、阻塞问题、待办事项、用户偏好等信息。",
    z.object({
      title: z.string().describe("笔记标题"),
      content: z.string().describe("笔记内容（Markdown 格式）"),
      note_type: z.enum(["task_state", "conclusion", "blocker", "action", "preference", "general"]).default("general").describe("笔记类型"),
      tags: z.array(z.string()).optional().describe("标签"),
    }),
    async (args) => {
      const userId = "default";
      const index = await getIndex(svc, userId);
      const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const ts = now();

      const meta: NoteMeta = {
        id,
        title: args.title,
        noteType: args.note_type,
        tags: args.tags ?? [],
        createdAt: ts,
        updatedAt: ts,
      };
      index.push(meta);

      const doc: NoteDoc = {
        content: args.content,
        metadata: meta,
      };

      await saveIndex(svc, userId, index);
      await saveNote(svc, userId, doc);
      return success("笔记已创建", { id });
    },
  );
}

export function createNoteSearchTool(svc: ToolServices): StructuredTool {
  return createTool(
    "note_search",
    "搜索笔记。根据关键词在笔记标题和标签中搜索。",
    z.object({
      query: z.string().describe("搜索关键词"),
      note_type: z.enum(["task_state", "conclusion", "blocker", "action", "preference", "general"]).optional().describe("按类型过滤"),
      limit: z.number().default(5).describe("返回条数"),
    }),
    async (args) => {
      const index = await getIndex(svc, "default");
      let candidates = index;

      if (args.note_type) {
        candidates = candidates.filter((m) => m.noteType === args.note_type);
      }

      const q = args.query.toLowerCase();
      const scored = candidates.map((m) => {
        const inTitle = m.title.toLowerCase().includes(q) ? 0.3 : 0;
        const inTags = m.tags.some((t) => t.toLowerCase().includes(q)) ? 0.2 : 0;
        return { meta: m, score: inTitle + inTags };
      });

      scored.sort((a, b) => b.score - a.score);
      const top = scored
        .filter((s) => s.score > 0)
        .slice(0, args.limit);

      if (top.length === 0) return "未找到匹配的笔记";

      return JSON.stringify(top.map((s) => s.meta));
    },
  );
}

export function createNoteReadTool(svc: ToolServices): StructuredTool {
  return createTool(
    "note_read",
    "读取一篇笔记的完整内容。",
    z.object({
      note_id: z.string().describe("笔记 ID"),
    }),
    async (args) => {
      const doc = await getNote(svc, "default", args.note_id);
      if (!doc) return error("笔记不存在");
      return JSON.stringify({
        id: doc.metadata.id,
        title: doc.metadata.title,
        type: doc.metadata.noteType,
        content: doc.content,
        tags: doc.metadata.tags,
        createdAt: doc.metadata.createdAt,
        updatedAt: doc.metadata.updatedAt,
      });
    },
  );
}

export function createNoteListTool(svc: ToolServices): StructuredTool {
  return createTool(
    "note_list",
    "列出最近的笔记。",
    z.object({
      note_type: z.enum(["task_state", "conclusion", "blocker", "action", "preference", "general"]).optional().describe("按类型过滤"),
      limit: z.number().default(10).describe("返回条数"),
    }),
    async (args) => {
      let index = await getIndex(svc, "default");
      if (args.note_type) {
        index = index.filter((m) => m.noteType === args.note_type);
      }
      index.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return JSON.stringify(index.slice(0, args.limit));
    },
  );
}

const noteToolFactories = [
  createNoteCreateTool,
  createNoteSearchTool,
  createNoteReadTool,
  createNoteListTool,
];

export default noteToolFactories;
