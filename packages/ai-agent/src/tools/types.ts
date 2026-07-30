import { StructuredTool } from "@langchain/core/tools";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

// Service interfaces — return types are intentionally loose (Promise<any>)
// because these are adapter interfaces that bridge the agent's generic
// tool layer with the server's concrete NestJS service implementations.
// Each service method signature is typed precisely for its parameters;
// the return type is left as any since the tools treat results as opaque JSON.

export interface PostService {
  findPage(args: Record<string, unknown>): Promise<any>;
  findOne(id: number): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
  update(id: number, args: Record<string, unknown>): Promise<any>;
  delete(id: number): Promise<any>;
  publish(id: number): Promise<any>;
  unpublish(id: number): Promise<any>;
  top(id: number): Promise<any>;
  untop(id: number): Promise<any>;
}

export interface CategoryService {
  findAll(): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
  update(id: number, args: Record<string, unknown>): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface TagService {
  findAll(): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
  update(id: number, args: Record<string, unknown>): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface CommentService {
  findPage(args: Record<string, unknown>): Promise<any>;
  approve(id: number): Promise<any>;
  reject(id: number): Promise<any>;
  reply(id: number, content: string): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface FriendLinkService {
  findAll(status?: string): Promise<any>;
  approve(id: number): Promise<any>;
  reject(id: number): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface GuestMessageService {
  findPage(args: Record<string, unknown>): Promise<any>;
  reply(id: number, content: string): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface AnnouncementService {
  findPage(args: Record<string, unknown>): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface ChangelogService {
  findPage(args: Record<string, unknown>): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
  delete(id: number): Promise<any>;
}

export interface SiteConfigService {
  get(): Promise<any>;
  update(args: Record<string, unknown>): Promise<any>;
}

export interface SeoSettingService {
  getLatest(): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
}

export interface IcpInfoService {
  getLatest(): Promise<any>;
  create(args: Record<string, unknown>): Promise<any>;
}

export interface SettingService {
  get(): Promise<any>;
  update(key: string, value: string): Promise<any>;
}

export interface VisitorService {
  getDashboard(): Promise<any>;
  findPage(args: Record<string, unknown>): Promise<any>;
  getOnlineCount(): Promise<any>;
}

export interface DataTransferService {
  export(): Promise<any>;
  import(data: string): Promise<any>;
}

export interface OssService {
  getSignUrl(key: string, expiresIn: number): Promise<any>;
}

export interface RedisService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
}

export interface ToolServices {
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
  redisService: RedisService;
}

export type ToolFactory = (services: ToolServices) => StructuredTool;

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