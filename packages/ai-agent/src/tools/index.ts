import { StructuredTool } from "@langchain/core/tools";
import type { ToolFactory, ToolServices, EditorToolFactory, EditorToolServices } from "./types";

export { type ToolFactory, type ToolServices, type EditorToolFactory, type EditorToolServices, type LlmConfig, type AgentConfig } from "./types";

// ---- post (7, without create/update) ----
import {
  createSearchPostsTool, createGetPostTool,
  createDeletePostTool,
  createPublishPostTool, createUnpublishPostTool,
  createTopPostTool, createUntopPostTool,
} from "./post.tool";

// ---- category (4) ----
import {
  createGetCategoriesTool, createCreateCategoryTool,
  createUpdateCategoryTool, createDeleteCategoryTool,
} from "./category.tool";

// ---- tag (4) ----
import {
  createGetTagsTool, createCreateTagTool,
  createUpdateTagTool, createDeleteTagTool,
} from "./tag.tool";

// ---- comment (5) ----
import {
  createGetCommentsTool, createApproveCommentTool,
  createRejectCommentTool, createReplyCommentTool,
  createDeleteCommentTool,
} from "./comment.tool";

// ---- friend-link (4) ----
import {
  createGetFriendLinksTool, createApproveFriendLinkTool,
  createRejectFriendLinkTool, createDeleteFriendLinkTool,
} from "./friend-link.tool";

// ---- guest-message (3) ----
import {
  createGetGuestMessagesTool, createReplyGuestMessageTool,
  createDeleteGuestMessageTool,
} from "./guest-message.tool";

// ---- announcement (3) ----
import {
  createGetAnnouncementsTool, createCreateAnnouncementTool,
  createDeleteAnnouncementTool,
} from "./announcement.tool";

// ---- changelog (3) ----
import {
  createGetChangelogsTool, createCreateChangelogTool,
  createDeleteChangelogTool,
} from "./changelog.tool";

// ---- site-config (8) ----
import {
  createGetSiteConfigTool, createUpdateSiteConfigTool,
  createGetSeoSettingsTool, createUpdateSeoSettingsTool,
  createGetIcpInfoTool, createUpdateIcpInfoTool,
  createGetSettingTool, createUpdateSettingTool,
} from "./site-config.tool";

// ---- visitor (3) ----
import {
  createGetVisitorDashboardTool, createGetVisitorLogsTool,
  createGetOnlineVisitorsTool,
} from "./visitor.tool";

// ---- data-transfer (2) ----
import { createExportDataTool, createImportDataTool } from "./data-transfer.tool";

// ---- oss (1) ----
import { createGetOssSignUrlTool } from "./oss.tool";

// ---- writing (9, without seo_meta) ----
import {
  createContinueWriteTool, createPolishTextTool,
  createSummarizeTextTool, createGenerateTitleTool,
  createGenerateOutlineTool, createSuggestTagsTool,
  createReviewArticleTool, createTranslateTextTool,
  createImitateStyleTool,
} from "./writing.tool";

// ---- memory (5) ----
import defaultMemoryTools from "./memory.tool";

// ---- note (4) ----
import defaultNoteTools from "./note.tool";

// ---- deep-task (1) ----
import defaultDeepTaskTools, { setDeepTaskLlmConfig } from "./deep-task.tool";

export { setDeepTaskLlmConfig };

// ---- Admin tool registry ----

const postTools: ToolFactory[] = [
  createSearchPostsTool, createGetPostTool,
  createDeletePostTool,
  createPublishPostTool, createUnpublishPostTool,
  createTopPostTool, createUntopPostTool,
];

const managementTools: ToolFactory[] = [
  createGetCategoriesTool, createCreateCategoryTool,
  createUpdateCategoryTool, createDeleteCategoryTool,
  createGetTagsTool, createCreateTagTool,
  createUpdateTagTool, createDeleteTagTool,
  createGetCommentsTool, createApproveCommentTool,
  createRejectCommentTool, createReplyCommentTool,
  createDeleteCommentTool,
  createGetFriendLinksTool, createApproveFriendLinkTool,
  createRejectFriendLinkTool, createDeleteFriendLinkTool,
  createGetGuestMessagesTool, createReplyGuestMessageTool,
  createDeleteGuestMessageTool,
  createGetAnnouncementsTool, createCreateAnnouncementTool,
  createDeleteAnnouncementTool,
  createGetChangelogsTool, createCreateChangelogTool,
  createDeleteChangelogTool,
];

const configTools: ToolFactory[] = [
  createGetSiteConfigTool, createUpdateSiteConfigTool,
  createGetSeoSettingsTool, createUpdateSeoSettingsTool,
  createGetIcpInfoTool, createUpdateIcpInfoTool,
  createGetSettingTool, createUpdateSettingTool,
  createGetOssSignUrlTool,
  createExportDataTool, createImportDataTool,
];

const analyticsTools: ToolFactory[] = [
  createGetVisitorDashboardTool, createGetVisitorLogsTool,
  createGetOnlineVisitorsTool,
];

export const adminToolFactories: ToolFactory[] = [
  ...postTools,
  ...managementTools,
  ...configTools,
  ...analyticsTools,
  ...defaultMemoryTools,
  ...defaultNoteTools,
  ...defaultDeepTaskTools,
];

export const dangerousToolNames = new Set([
  "delete_post",
  "delete_category",
  "delete_tag",
  "delete_comment",
  "delete_friend_link",
  "delete_guest_message",
  "delete_announcement",
  "delete_changelog",
  "import_data",
]);

export function createAdminTools(services: ToolServices): StructuredTool[] {
  return adminToolFactories.map((factory) => factory(services));
}

// ---- Editor tool registry ----

const editorWritingTools: EditorToolFactory[] = [
  createContinueWriteTool, createPolishTextTool,
  createSummarizeTextTool, createGenerateTitleTool,
  createGenerateOutlineTool, createSuggestTagsTool,
  createReviewArticleTool, createTranslateTextTool,
  createImitateStyleTool,
];

export const editorToolFactories: EditorToolFactory[] = [
  ...editorWritingTools,
];

export const editorDangerousToolNames: string[] = [];

export function createEditorTools(services: EditorToolServices): StructuredTool[] {
  return editorToolFactories.map((factory) => factory(services));
}
