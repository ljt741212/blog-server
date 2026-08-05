import { StructuredTool } from "@langchain/core/tools";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

// ---- Server response shapes ----

export interface PaginatedResult<T> {
  items: T[];
  meta: { total: number; current: number; pageSize: number };
}

export type PostStatus = "draft" | "published" | "archived";

export interface PostAdminItem {
  id: string;
  title: string;
  summary: string | null;
  coverImage: string | null;
  status: PostStatus;
  isTop: boolean;
  categoryId: number | undefined;
  category: string | undefined;
  tagIds: number[];
  tags: string;
  author: string | undefined;
  publishTime: Date | null;
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryItem {
  id: number;
  name: string;
  description?: string | null;
}

export interface TagItem {
  id: number;
  name: string;
  description?: string | null;
}

export type CommentStatus = "pending" | "approved" | "rejected";

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
}

export interface ChangelogItem {
  id: number;
  title: string;
  content: string;
}

// ---- Service interfaces ----

export interface PostService {
  findPage(args: Record<string, unknown>): Promise<PaginatedResult<PostAdminItem>>;
  findOne(id: number): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(id: number, args: Record<string, unknown>): Promise<unknown>;
  delete(id: number): Promise<unknown>;
  publish(id: number): Promise<unknown>;
  unpublish(id: number): Promise<unknown>;
  top(id: number): Promise<unknown>;
  untop(id: number): Promise<unknown>;
}

export interface CategoryService {
  findAll(): Promise<CategoryItem[]>;
  create(args: Record<string, unknown>): Promise<CategoryItem>;
  update(id: number, args: Record<string, unknown>): Promise<unknown>;
  delete(id: number): Promise<unknown>;
}

export interface TagService {
  findAll(): Promise<TagItem[]>;
  create(args: Record<string, unknown>): Promise<TagItem>;
  update(id: number, args: Record<string, unknown>): Promise<unknown>;
  delete(id: number): Promise<unknown>;
}

export interface CommentService {
  findPage(args: Record<string, unknown>): Promise<unknown>;
  approve(id: number): Promise<unknown>;
  reject(id: number): Promise<unknown>;
  reply(id: number, content: string): Promise<unknown>;
  delete(id: number): Promise<unknown>;
}

export interface FriendLinkService {
  findAll(status?: string): Promise<unknown>;
  approve(id: number): Promise<unknown>;
  reject(id: number): Promise<unknown>;
  delete(id: number): Promise<unknown>;
}

export interface GuestMessageService {
  findPage(args: Record<string, unknown>): Promise<unknown>;
  reply(id: number, content: string): Promise<unknown>;
  delete(id: number): Promise<unknown>;
}

export interface AnnouncementService {
  findPage(args: Record<string, unknown>): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<AnnouncementItem>;
  delete(id: number): Promise<unknown>;
}

export interface ChangelogService {
  findPage(args: Record<string, unknown>): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<ChangelogItem>;
  delete(id: number): Promise<unknown>;
}

export interface SiteConfigService {
  get(): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
}

export interface SeoSettingService {
  getLatest(): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
}

export interface IcpInfoService {
  getLatest(): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<unknown>;
}

export interface SettingService {
  getAll(): Promise<unknown>;
  save(dto: Record<string, unknown>): Promise<unknown>;
}

export interface VisitorService {
  getDashboardStats(): Promise<unknown>;
  paginateForAdmin(args: Record<string, unknown>): Promise<unknown>;
  getOnlineStats(): Promise<unknown>;
}

export interface DataTransferService {
  exportAllToZip(...args: unknown[]): Promise<unknown>;
  importAllFromZip(data: string, options?: Record<string, unknown>): Promise<unknown>;
}

export interface OssService {
  signUrl(key: string): string;
}

export interface MemoryService {
  add(input: { userId: number; content: string; importance: number }): Promise<{ id: number }>;
  search(input: { userId: number; query: string; limit: number }): Promise<Array<{ id: number; content: string; importance: number; createdAt: string }>>;
  forget(input: { userId: number; strategy: "importance_based" | "time_based" | "capacity_based"; threshold?: number; maxAgeDays?: number }): Promise<{ deleted: number }>;
  summary(userId: number): Promise<{ total: number; avgImportance: string }>;
}

export interface RedisService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

export interface ToolServices {
  getUserId(): number;
  postService: PostService;
  categoryService: CategoryService;
  tagService: TagService;
  commentService: CommentService;
  friendLinkService: FriendLinkService;
  guestMessageService: GuestMessageService;
  announcementService: AnnouncementService;
  changelogService: ChangelogService;
  siteConfigService: SiteConfigService;
  seoSettingService: SeoSettingService;
  icpInfoService: IcpInfoService;
  settingService: SettingService;
  visitorService: VisitorService;
  dataTransferService: DataTransferService;
  ossService: OssService;
  memoryService: MemoryService;
  redisService: RedisService;
}

export type ToolFactory = (services: ToolServices) => StructuredTool;

// Minimal read-only services for article editor agent
export interface EditorToolServices {
  categoryService: Pick<CategoryService, "findAll">;
  tagService: Pick<TagService, "findAll">;
}

export type EditorToolFactory = (services: EditorToolServices) => StructuredTool;

export interface LlmConfig {
  provider: "openai" | "deepseek" | "anthropic";
  model: string;
  apiKey: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AgentConfig {
  llmConfig: LlmConfig;
  services: ToolServices;
  dangerousToolNames: string[];
  checkpointer?: BaseCheckpointSaver;
}
