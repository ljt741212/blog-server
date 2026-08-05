export const POLISH_PROMPTS: Record<string, string> = {
  formal: "请润色以下文本，使其表达更正式、更流畅，修正语法错误，保持原意不变。",
  casual: "请润色以下文本，使其表达更口语化、更自然，修正语法错误，保持原意不变。",
  academic: "请润色以下文本，使其表达更学术化、更严谨，修正语法错误，保持原意不变。",
};

export const CONTINUE_WRITE_PROMPT = "请根据以下内容续写，保持风格和语气一致，逻辑连贯：";

export const SUMMARIZE_PROMPT = "请用简洁的语言总结以下内容，控制在 200 字以内：";

export const GENERATE_TITLE_PROMPT =
  "请为以下文章生成 3-5 个标题建议，每个标题不超过 30 字，要求吸引人且准确反映文章内容：";

export const GENERATE_OUTLINE_PROMPT = "请为以下主题生成一个结构化的文章大纲，包含二级和三级标题：";

export const SUGGEST_TAGS_PROMPT =
  "请根据以下文章内容，推荐 3-5 个标签和 1-2 个分类建议。返回格式：{ tags: string[], category: string }。当前已有分类和标签信息供参考：";

export const REVIEW_ARTICLE_PROMPT =
  "请审阅以下文章，检查错别字、语病、逻辑问题，给出具体的修改建议。如果文章质量很好，也请告知：";

export const TRANSLATE_PROMPTS: Record<string, string> = {
  "zh-en": "请将以下中文翻译成英文，保持原意和风格：",
  "en-zh": "请将以下英文翻译成中文，保持原意和风格：",
};

export const IMITATE_STYLE_PROMPT =
  "请分析以下示例文章的风格特点（语气、句式、用词习惯、段落结构等），然后模仿该风格写作以下内容：";