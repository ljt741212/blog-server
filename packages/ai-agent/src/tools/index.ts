import { StructuredTool } from "@langchain/core/tools";
import type { ToolFactory, ToolServices } from "./types";

export { type ToolFactory, type ToolServices, type LlmConfig, type AgentConfig } from "./types";

// ---- post (9) ----
import {
  createSearchPostsTool, createGetPostTool, createCreatePostTool,
  createUpdatePostTool, createDeletePostTool,
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

// ---- writing (10) ----
import {
  createContinueWriteTool, createPolishTextTool,
  createSummarizeTextTool, createGenerateTitleTool,
  createGenerateOutlineTool, createSuggestTagsTool,
  createGenerateSeoMetaTool, createReviewArticleTool,
  createTranslateTextTool, createImitateStyleTool,
} from "./writing.tool";

// ---- Registry ----

export const allToolFactories: ToolFactory[] = [
  // post
  createSearchPostsTool, createGetPostTool, createCreatePostTool,
  createUpdatePostTool, createDeletePostTool,
  createPublishPostTool, createUnpublishPostTool,
  createTopPostTool, createUntopPostTool,
  // category
  createGetCategoriesTool, createCreateCategoryTool,
  createUpdateCategoryTool, createDeleteCategoryTool,
  // tag
  createGetTagsTool, createCreateTagTool,
  createUpdateTagTool, createDeleteTagTool,
  // comment
  createGetCommentsTool, createApproveCommentTool,
  createRejectCommentTool, createReplyCommentTool,
  createDeleteCommentTool,
  // friend-link
  createGetFriendLinksTool, createApproveFriendLinkTool,
  createRejectFriendLinkTool, createDeleteFriendLinkTool,
  // guest-message
  createGetGuestMessagesTool, createReplyGuestMessageTool,
  createDeleteGuestMessageTool,
  // announcement
  createGetAnnouncementsTool, createCreateAnnouncementTool,
  createDeleteAnnouncementTool,
  // changelog
  createGetChangelogsTool, createCreateChangelogTool,
  createDeleteChangelogTool,
  // site-config
  createGetSiteConfigTool, createUpdateSiteConfigTool,
  createGetSeoSettingsTool, createUpdateSeoSettingsTool,
  createGetIcpInfoTool, createUpdateIcpInfoTool,
  createGetSettingTool, createUpdateSettingTool,
  // visitor
  createGetVisitorDashboardTool, createGetVisitorLogsTool,
  createGetOnlineVisitorsTool,
  // data-transfer
  createExportDataTool, createImportDataTool,
  // oss
  createGetOssSignUrlTool,
  // writing
  createContinueWriteTool, createPolishTextTool,
  createSummarizeTextTool, createGenerateTitleTool,
  createGenerateOutlineTool, createSuggestTagsTool,
  createGenerateSeoMetaTool, createReviewArticleTool,
  createTranslateTextTool, createImitateStyleTool,
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

export function createAllTools(services: ToolServices): StructuredTool[] {
  return allToolFactories.map((factory) => factory(services));
}