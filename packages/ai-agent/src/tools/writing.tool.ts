import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StructuredTool } from "@langchain/core/tools";
import { createChatModel } from "../agent/chat-model.js";
import type { ToolServices, LlmConfig } from "./types";
import {
  CONTINUE_WRITE_PROMPT, POLISH_PROMPTS, SUMMARIZE_PROMPT,
  GENERATE_TITLE_PROMPT, GENERATE_OUTLINE_PROMPT, SUGGEST_TAGS_PROMPT,
  GENERATE_SEO_META_PROMPT, REVIEW_ARTICLE_PROMPT, TRANSLATE_PROMPTS,
  IMITATE_STYLE_PROMPT,
} from "../prompts/writing.js";

let _llmConfig: LlmConfig | null = null;

export function setWritingLlmConfig(config: LlmConfig) {
  _llmConfig = config;
}

function getModel() {
  if (!_llmConfig) throw new Error("Writing LLM config not set");
  return createChatModel(_llmConfig);
}

export function createContinueWriteTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "continue_write";
    description = "根据已有内容续写文章，保持风格和语气一致。";
    schema = z.object({
      text: z.string().describe("已有内容，作为续写的前文"),
      length: z.number().optional().default(500).describe("续写字数"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(CONTINUE_WRITE_PROMPT),
        new HumanMessage(`续写约 ${args.length} 字：\n\n${args.text}`),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createPolishTextTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "polish_text";
    description = "润色文本，优化表达、修正语法、提升流畅度，保持原意不变。";
    schema = z.object({
      text: z.string().describe("需要润色的原始文本"),
      style: z.enum(["formal", "casual", "academic"]).optional().default("formal")
        .describe("润色风格"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(POLISH_PROMPTS[args.style ?? "formal"]),
        new HumanMessage(args.text),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createSummarizeTextTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "summarize_text";
    description = "生成文本摘要，控制在 200 字以内。";
    schema = z.object({ text: z.string().describe("需要摘要的文本") });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(SUMMARIZE_PROMPT),
        new HumanMessage(args.text),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createGenerateTitleTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "generate_title";
    description = "为文章生成 3-5 个标题建议，每个不超过 30 字。";
    schema = z.object({ content: z.string().describe("文章内容") });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(GENERATE_TITLE_PROMPT),
        new HumanMessage(args.content),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createGenerateOutlineTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "generate_outline";
    description = "为给定主题生成结构化文章大纲，包含二级和三级标题。";
    schema = z.object({ topic: z.string().describe("文章主题") });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(GENERATE_OUTLINE_PROMPT),
        new HumanMessage(args.topic),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createSuggestTagsTool(services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "suggest_tags";
    description = "根据文章内容推荐标签和分类。";
    schema = z.object({ content: z.string().describe("文章内容") });
    async _call(args: z.infer<typeof this.schema>) {
      const categories = await services.categoryService.findAll();
      const tags = await services.tagService.findAll();
      const context = `现有分类: ${JSON.stringify(categories)}\n现有标签: ${JSON.stringify(tags)}`;
      const resp = await getModel().invoke([
        new SystemMessage(SUGGEST_TAGS_PROMPT + "\n" + context),
        new HumanMessage(args.content),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createGenerateSeoMetaTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "generate_seo_meta";
    description = "为文章生成 SEO 元数据（description 和 keywords）。";
    schema = z.object({ content: z.string().describe("文章内容") });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(GENERATE_SEO_META_PROMPT),
        new HumanMessage(args.content),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createReviewArticleTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "review_article";
    description = "审阅文章，检查错别字、语病、逻辑问题，给出修改建议。";
    schema = z.object({ content: z.string().describe("文章内容") });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(REVIEW_ARTICLE_PROMPT),
        new HumanMessage(args.content),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createTranslateTextTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "translate_text";
    description = "翻译文本，支持中英互译。";
    schema = z.object({
      text: z.string().describe("要翻译的文本"),
      direction: z.enum(["zh-en", "en-zh"]).optional().default("zh-en")
        .describe("翻译方向：zh-en=中译英, en-zh=英译中"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(TRANSLATE_PROMPTS[args.direction ?? "zh-en"]),
        new HumanMessage(args.text),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}

export function createImitateStyleTool(_services: ToolServices): StructuredTool {
  return new (class extends StructuredTool {
    name = "imitate_style";
    description = "分析示例文章的风格特点，然后模仿该风格写作。";
    schema = z.object({
      samples: z.string().describe("示例文章（用于分析风格）"),
      content: z.string().describe("要写作的内容或主题"),
    });
    async _call(args: z.infer<typeof this.schema>) {
      const resp = await getModel().invoke([
        new SystemMessage(IMITATE_STYLE_PROMPT),
        new HumanMessage(`示例文章：\n${args.samples}\n\n写作内容：\n${args.content}`),
      ]);
      return (resp.content as string) ?? "";
    }
  })();
}