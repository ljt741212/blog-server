import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import { createChatModel } from "../agent/chat-model";
import type { ToolServices, LlmConfig } from "./types";
import { createTool } from "./helper";
import {
  CONTINUE_WRITE_PROMPT, POLISH_PROMPTS, SUMMARIZE_PROMPT,
  GENERATE_TITLE_PROMPT, GENERATE_OUTLINE_PROMPT, SUGGEST_TAGS_PROMPT,
  GENERATE_SEO_META_PROMPT, REVIEW_ARTICLE_PROMPT, TRANSLATE_PROMPTS,
  IMITATE_STYLE_PROMPT,
} from "../prompts/writing";

let _llmConfig: LlmConfig | null = null;

export function setWritingLlmConfig(config: LlmConfig) {
  _llmConfig = config;
}

function getModel() {
  if (!_llmConfig) throw new Error("Writing LLM config not set");
  return createChatModel(_llmConfig);
}

async function invokeWriting(prompt: string, input: string): Promise<string> {
  const resp = await getModel().invoke([new SystemMessage(prompt), new HumanMessage(input)]);
  return (resp.content as string) ?? "";
}

export function createContinueWriteTool(_svc: ToolServices): StructuredTool {
  return createTool("continue_write", "根据已有内容续写文章，保持风格和语气一致。",
    z.object({ text: z.string().describe("已有内容，作为续写的前文"), length: z.number().optional().default(500).describe("续写字数") }),
    (args) => invokeWriting(CONTINUE_WRITE_PROMPT, `续写约 ${args.length} 字：\n\n${args.text}`));
}

export function createPolishTextTool(_svc: ToolServices): StructuredTool {
  return createTool("polish_text", "润色文本，优化表达、修正语法、提升流畅度，保持原意不变。",
    z.object({ text: z.string().describe("需要润色的原始文本"), style: z.enum(["formal", "casual", "academic"]).optional().default("formal").describe("润色风格") }),
    (args) => invokeWriting(POLISH_PROMPTS[args.style ?? "formal"], args.text));
}

export function createSummarizeTextTool(_svc: ToolServices): StructuredTool {
  return createTool("summarize_text", "生成文本摘要，控制在 200 字以内。",
    z.object({ text: z.string().describe("需要摘要的文本") }),
    (args) => invokeWriting(SUMMARIZE_PROMPT, args.text));
}

export function createGenerateTitleTool(_svc: ToolServices): StructuredTool {
  return createTool("generate_title", "为文章生成 3-5 个标题建议，每个不超过 30 字。",
    z.object({ content: z.string().describe("文章内容") }),
    (args) => invokeWriting(GENERATE_TITLE_PROMPT, args.content));
}

export function createGenerateOutlineTool(_svc: ToolServices): StructuredTool {
  return createTool("generate_outline", "为给定主题生成结构化文章大纲。",
    z.object({ topic: z.string().describe("文章主题") }),
    (args) => invokeWriting(GENERATE_OUTLINE_PROMPT, args.topic));
}

export function createSuggestTagsTool(svc: ToolServices): StructuredTool {
  return createTool("suggest_tags", "根据文章内容推荐标签和分类。",
    z.object({ content: z.string().describe("文章内容") }),
    async (args) => {
      const categories = await svc.categoryService.findAll();
      const tags = await svc.tagService.findAll();
      const context = `现有分类: ${JSON.stringify(categories)}\n现有标签: ${JSON.stringify(tags)}`;
      return invokeWriting(SUGGEST_TAGS_PROMPT + "\n" + context, args.content);
    });
}

export function createGenerateSeoMetaTool(_svc: ToolServices): StructuredTool {
  return createTool("generate_seo_meta", "为文章生成 SEO 元数据（description 和 keywords）。",
    z.object({ content: z.string().describe("文章内容") }),
    (args) => invokeWriting(GENERATE_SEO_META_PROMPT, args.content));
}

export function createReviewArticleTool(_svc: ToolServices): StructuredTool {
  return createTool("review_article", "审阅文章，检查错别字、语病、逻辑问题，给出修改建议。",
    z.object({ content: z.string().describe("文章内容") }),
    (args) => invokeWriting(REVIEW_ARTICLE_PROMPT, args.content));
}

export function createTranslateTextTool(_svc: ToolServices): StructuredTool {
  return createTool("translate_text", "翻译文本，支持中英互译。",
    z.object({ text: z.string().describe("要翻译的文本"), direction: z.enum(["zh-en", "en-zh"]).optional().default("zh-en").describe("翻译方向") }),
    (args) => invokeWriting(TRANSLATE_PROMPTS[args.direction ?? "zh-en"], args.text));
}

export function createImitateStyleTool(_svc: ToolServices): StructuredTool {
  return createTool("imitate_style", "分析示例文章的风格特点，然后模仿该风格写作。",
    z.object({ samples: z.string().describe("示例文章（用于分析风格）"), content: z.string().describe("要写作的内容或主题") }),
    (args) => invokeWriting(IMITATE_STYLE_PROMPT, `示例文章：\n${args.samples}\n\n写作内容：\n${args.content}`));
}