import { StructuredTool } from "@langchain/core/tools";
import { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";

export interface PostService {
  findPage(args: Record<string, unknown>): Promise<{ items: Record<string, unknown>[]; total: number }>;
  findOne(id: number): Promise<Record<string, unknown> | null>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(id: number, args: Record<string, unknown>): Promise<void>;
  delete(id: number): Promise<void>;
  publish(id: number): Promise<void>;
  unpublish(id: number): Promise<void>;
  top(id: number): Promise<void>;
  untop(id: number): Promise<void>;
}

export interface CategoryService {
  findAll(): Promise<Record<string, unknown>[]>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(id: number, args: Record<string, unknown>): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface TagService {
  findAll(): Promise<Record<string, unknown>[]>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  update(id: number, args: Record<string, unknown>): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface CommentService {
  findPage(args: Record<string, unknown>): Promise<{ items: unknown[]; total: number }>;
  approve(id: number): Promise<void>;
  reject(id: number): Promise<void>;
  reply(id: number, content: string): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface FriendLinkService {
  findAll(status?: string): Promise<unknown[]>;
  approve(id: number): Promise<void>;
  reject(id: number): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface GuestMessageService {
  findPage(args: Record<string, unknown>): Promise<{ items: unknown[]; total: number }>;
  reply(id: number, content: string): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface AnnouncementService {
  findPage(args: Record<string, unknown>): Promise<{ items: unknown[]; total: number }>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  delete(id: number): Promise<void>;
}

export interface ChangelogService {
  findPage(args: Record<string, unknown>): Promise<{ items: unknown[]; total: number }>;
  create(args: Record<string, unknown>): Promise<Record<string, unknown>>;
  delete(id: number): Promise<void>;
}

export interface SiteConfigService {
  get(): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<void>;
}

export interface SeoSettingService {
  getLatest(): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<void>;
}

export interface IcpInfoService {
  getLatest(): Promise<unknown>;
  create(args: Record<string, unknown>): Promise<void>;
}

export interface SettingService {
  get(): Promise<unknown>;
  update(key: string, value: string): Promise<void>;
}

export interface VisitorService {
  getDashboard(): Promise<unknown>;
  findPage(args: Record<string, unknown>): Promise<{ items: unknown[]; total: number }>;
  getOnlineCount(): Promise<number>;
}

export interface DataTransferService {
  export(): Promise<unknown>;
  import(data: string): Promise<void>;
}

export interface OssService {
  getSignUrl(key: string, expiresIn: number): Promise<string>;
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
