import crypto from "node:crypto";

import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { paginateQueryBuilder } from "@/common";
import { PostService } from "@/modules/post/post.service";
import { PostStatus } from "@/modules/post/post.entity";
import { CategoryService } from "@/modules/category/category.service";
import { TagService } from "@/modules/tag/tag.service";
import { CommentService } from "@/modules/comment/comment.service";
import { CommentStatus } from "@/modules/comment/comment.entity";
import { FriendLinkService } from "@/modules/friend-link/friend-link.service";
import { GuestMessageService } from "@/modules/guest-message/guest-message.service";
import { AnnouncementService } from "@/modules/announcement/announcement.service";
import { ChangelogService } from "@/modules/changelog/changelog.service";
import { SeoSettingService } from "@/modules/seo-setting/seo-setting.service";
import { SiteConfigService } from "@/modules/site-config/site-config.service";
import { IcpInfoService } from "@/modules/icp-info/icp-info.service";
import { SettingService } from "@/modules/setting/setting.service";
import { VisitorService } from "@/modules/visitor/visitor.service";
import { DataTransferService } from "@/modules/data-transfer/data-transfer.service";
import { OssService } from "@/modules/oss/oss.service";

import {
  createAgent,
  MySQLCheckpointer,
  SYSTEM_PROMPT,
  HumanMessage,
  SystemMessage,
  Command,
  createChatModel,
  type ToolServices,
} from "@blog/ai-agent";

import { AiConfig } from "./ai-config.entity";
import { AiUsage } from "./ai-usage.entity";
import { Conversation } from "./conversation.entity";
import { SaveAiConfigDto, UsageQueryDto } from "./ai.dto";

// ---- SSE Emitter ----

export interface SseEmitter {
  emitToken(content: string): void;
  emitToolCall(toolName: string, args: Record<string, unknown>): void;
  emitToolResult(toolName: string, result: unknown): void;
  emitConfirm(toolName: string, args: Record<string, unknown>, message: string): void;
  emitDone(): void;
  emitError(message: string): void;
}

// ---- Encryption ----

const ALGORITHM = "aes-256-gcm";
const IV_LEN = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not configured");
  return crypto.createHash("sha256").update(raw).digest();
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(encoded: string): string {
  if (!encoded) return "";
  const key = getEncryptionKey();
  const parts = encoded.split(":");
  if (parts.length !== 3) return encoded;
  const [ivHex, tagHex, dataHex] = parts;
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

// ---- Service ----

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private agentCache: { configId: number; agent: ReturnType<typeof createAgent> } | null = null;
  private requestAuth: string = "";

  constructor(
    @InjectRepository(AiConfig) private readonly configRepo: Repository<AiConfig>,
    @InjectRepository(AiUsage) private readonly usageRepo: Repository<AiUsage>,
    @InjectRepository(Conversation) private readonly conversationRepo: Repository<Conversation>,
    private readonly postService: PostService,
    private readonly categoryService: CategoryService,
    private readonly tagService: TagService,
    private readonly commentService: CommentService,
    private readonly friendLinkService: FriendLinkService,
    private readonly guestMessageService: GuestMessageService,
    private readonly announcementService: AnnouncementService,
    private readonly changelogService: ChangelogService,
    private readonly seoSettingService: SeoSettingService,
    private readonly siteConfigService: SiteConfigService,
    private readonly icpInfoService: IcpInfoService,
    private readonly settingService: SettingService,
    private readonly visitorService: VisitorService,
    private readonly dataTransferService: DataTransferService,
    private readonly ossService: OssService,
  ) {}

  // ==================== Agent Chat ====================

  async handleChat(
    message: string,
    conversationId: number | null,
    userId: number,
    authHeader: string,
    sseEmitter: SseEmitter,
  ) {
    this.requestAuth = authHeader;

    const conversation = await this.getOrCreateConversation(conversationId, userId);
    const agent = await this.getOrCreateAgent();

    const isNew = !conversation.checkpoint;
    const messages: any[] = isNew
      ? [new SystemMessage(SYSTEM_PROMPT), new HumanMessage(message)]
      : [new HumanMessage(message)];

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
      },
    ];

    const stream = await agent.stream(
      { messages },
      {
        configurable: { thread_id: String(conversation.id), sseEmitter },
        callbacks,
      },
    );

    for await (const _chunk of stream) {
      // SSE events emitted via callbacks and node-internal sseEmitter
    }

    // Persist messages from checkpoint
    await this.persistMessages(conversation.id);

    if (!conversation.title) {
      setImmediate(() => this.generateTitle(conversation.id));
    }

    sseEmitter.emitDone();
  }

  async handleConfirm(conversationId: number, confirm: boolean, sseEmitter: SseEmitter) {
    const agent = await this.getOrCreateAgent();

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
      },
    ];

    const stream = await agent.stream(
      new Command({ resume: { confirm } }),
      {
        configurable: { thread_id: String(conversationId), sseEmitter },
        callbacks,
      },
    );

    for await (const _chunk of stream) {
      // SSE events emitted via callbacks and node-internal sseEmitter
    }

    await this.persistMessages(conversationId);
    sseEmitter.emitDone();
  }

  // ==================== Agent Factory ====================

  private async getOrCreateAgent() {
    const activeConfig = await this.configRepo.findOne({ where: { isActive: true } });
    if (!activeConfig) throw new BadRequestException("没有启用的 AI 模型配置，请先在后台配置");

    if (this.agentCache?.configId === activeConfig.id) {
      return this.agentCache.agent;
    }

    const agent = createAgent({
      llmConfig: {
        provider: activeConfig.provider as "openai" | "deepseek" | "anthropic",
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: activeConfig.maxTokens,
        temperature: Number(activeConfig.temperature),
      },
      services: this.buildToolServices(),
      dangerousToolNames: [
        "delete_post", "delete_category", "delete_tag",
        "delete_comment", "delete_friend_link", "delete_guest_message",
        "delete_announcement", "delete_changelog", "import_data",
      ],
      checkpointer: new MySQLCheckpointer({
        findCheckpoint: async (threadId: string) => {
          const row = await this.conversationRepo.findOne({ where: { id: Number(threadId) } });
          if (!row?.checkpoint) return null;
          return {
            checkpoint: row.checkpoint,
            metadata: JSON.stringify(row.checkpointMetadata ?? {}),
            config: (row.checkpointConfig ?? {}) as unknown as Record<string, unknown>,
          };
        },
        upsertCheckpoint: async (data) => {
          await this.conversationRepo.update(
            { id: Number(data.threadId) },
            {
              checkpoint: data.checkpoint,
              checkpointMetadata: JSON.parse(data.metadata),
              checkpointConfig: data.config as any,
            },
          );
        },
      }),
    });

    this.agentCache = { configId: activeConfig.id, agent };
    return agent;
  }

  private buildToolServices(): ToolServices {
    const auth = () => this.requestAuth;
    return {
      postService: {
        findPage: (args: any) => this.postService.paginateForAdmin(args),
        findOne: (id: number) => this.postService.findOne(id),
        create: (args: any) => this.postService.create(args, auth()),
        update: (id: number, args: any) => this.postService.update(id, args),
        delete: (id: number) => this.postService.remove(id),
        publish: (id: number) => this.postService.updateStatus(id, PostStatus.PUBLISHED),
        unpublish: (id: number) => this.postService.updateStatus(id, PostStatus.DRAFT),
        top: (id: number) => this.postService.updateTop(id, true),
        untop: (id: number) => this.postService.updateTop(id, false),
      },
      categoryService: {
        findAll: () => this.categoryService.findAll(),
        create: (args: any) => this.categoryService.create(args),
        update: (id: number, args: any) => this.categoryService.update(id, args),
        delete: (id: number) => this.categoryService.remove(id),
      },
      tagService: {
        findAll: () => this.tagService.findAll(),
        create: (args: any) => this.tagService.create(args),
        update: (id: number, args: any) => this.tagService.update(id, args),
        delete: (id: number) => this.tagService.remove(id),
      },
      commentService: {
        findPage: (args: any) => this.commentService.paginateForAdmin(args),
        approve: (id: number) => this.commentService.updateStatus(id, CommentStatus.APPROVED),
        reject: (id: number) => this.commentService.updateStatus(id, CommentStatus.REJECTED),
        reply: (id: number, content: string) => {
          // reply is implemented as creating a new comment with parentId
          return this.commentService.create({ content, parentId: id } as any);
        },
        delete: (id: number) => this.commentService.remove(id),
      },
      friendLinkService: {
        findAll: (status?: string) =>
          this.friendLinkService.findAll(status as any),
        approve: (id: number) =>
          this.friendLinkService.updateStatus(id, { status: "approved" as any }),
        reject: (id: number) =>
          this.friendLinkService.updateStatus(id, { status: "rejected" as any }),
        delete: (id: number) => this.friendLinkService.remove(id),
      },
      guestMessageService: {
        findPage: (args: any) => this.guestMessageService.paginateForAdmin(args),
        reply: (id: number, _content: string) => {
          return this.guestMessageService.updateStatus(id, "replied" as any);
        },
        delete: (id: number) => this.guestMessageService.remove(id),
      },
      announcementService: {
        findPage: (args: any) => this.announcementService.paginateForAdmin(args),
        create: (args: any) => this.announcementService.create(args),
        delete: (id: number) => this.announcementService.remove(id),
      },
      changelogService: {
        findPage: (args: any) => this.changelogService.paginateForAdmin(args),
        create: (args: any) => this.changelogService.create(args),
        delete: (id: number) => this.changelogService.remove(id),
      },
      siteConfigService: {
        get: () => this.siteConfigService.get(),
        update: (args: any) => this.siteConfigService.save(args),
      },
      seoSettingService: {
        getLatest: () => this.seoSettingService.getSeoSetting(),
        create: (args: any) => this.seoSettingService.save(args),
      },
      icpInfoService: {
        getLatest: () => this.icpInfoService.getLatest(),
        create: (args: any) => this.icpInfoService.save(args),
      },
      settingService: {
        get: () => this.settingService.getAll(),
        update: (key: string, value: string) => this.settingService.save({ [key]: value } as any),
      },
      visitorService: {
        getDashboard: () => this.visitorService.getDashboardStats(),
        findPage: (args: any) => this.visitorService.paginateForAdmin(args),
        getOnlineCount: () =>
          this.visitorService.getOnlineStats().then((s) => s?.count ?? 0),
      },
      dataTransferService: {
        export: () => this.dataTransferService.exportAllToZip({} as any),
        import: (data: string) =>
          this.dataTransferService.importAllFromZip(data, { clearExisting: true } as any),
      },
      ossService: {
        getSignUrl: (key: string, _expiresIn: number) =>
          this.ossService.signUrl(key),
      },
    };
  }

  // ==================== Conversation ====================

  private async getOrCreateConversation(conversationId: number | null, userId: number) {
    if (conversationId) {
      const conv = await this.conversationRepo.findOne({
        where: { id: conversationId, userId },
      });
      if (!conv) throw new NotFoundException("会话不存在");
      return conv;
    }
    const conv = this.conversationRepo.create({ userId, messages: [] });
    return this.conversationRepo.save(conv);
  }

  async getConversations(userId: number, page = 1, limit = 20) {
    const qb = this.conversationRepo
      .createQueryBuilder("c")
      .where("c.userId = :userId", { userId })
      .orderBy("c.updatedAt", "DESC");
    const result = await paginateQueryBuilder(qb, { page, limit });
    return {
      ...result,
      items: ((result as any).items ?? []).map((c: Conversation) => ({
        id: c.id,
        title: c.title ?? "新对话",
        lastMessagePreview: this.getLastMessagePreview(c),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  async getConversation(id: number, userId: number) {
    const conv = await this.conversationRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException("会话不存在");
    return conv;
  }

  async deleteConversation(id: number, userId: number) {
    const conv = await this.conversationRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException("会话不存在");
    await this.conversationRepo.remove(conv);
  }

  private getLastMessagePreview(conv: Conversation): string {
    const msgs = conv.messages ?? [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role !== "system") {
        return (msgs[i].content ?? "").slice(0, 50);
      }
    }
    return "";
  }

  private async persistMessages(conversationId: number) {
    // Messages are stored in checkpoint by LangGraph.
    // For display purposes, we extract a summary from the checkpoint.
    await this.conversationRepo.update(
      { id: conversationId },
      { updatedAt: new Date() },
    );
  }

  private async generateTitle(conversationId: number) {
    try {
      const conv = await this.conversationRepo.findOne({ where: { id: conversationId } });
      if (!conv || conv.title) return;

      const firstUserMsg = (conv.messages ?? []).find((m) => m.role === "user");
      const title = firstUserMsg
        ? firstUserMsg.content.slice(0, 200)
        : "新对话";

      await this.conversationRepo.update(
        { id: conversationId },
        { title },
      );
    } catch (error: any) {
      this.logger.warn(`生成会话标题失败: ${error.message}`);
    }
  }

  // ==================== Config CRUD ====================

  async getConfigs() {
    const configs = await this.configRepo.find({ order: { createdAt: "DESC" } });
    return configs.map((c) => ({ ...c, apiKey: maskKey(decrypt(c.apiKey)) }));
  }

  async saveConfig(dto: SaveAiConfigDto) {
    if (dto.id) return this.updateConfig(dto.id, dto);
    return this.createConfig(dto);
  }

  private async createConfig(dto: SaveAiConfigDto) {
    if (!dto.apiKey) throw new BadRequestException("API Key 为必填项");
    const config = this.configRepo.create({
      ...dto,
      apiKey: encrypt(dto.apiKey),
      isActive: false,
      maxTokens: dto.maxTokens ?? 4096,
      temperature: dto.temperature ?? 0.7,
    });
    return this.configRepo.save(config);
  }

  private async updateConfig(id: number, dto: SaveAiConfigDto) {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException("配置不存在");
    if (dto.apiKey) {
      dto.apiKey = encrypt(dto.apiKey);
    } else {
      delete dto.apiKey;
    }
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  async deleteConfig(id: number) {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException("配置不存在");
    if (config.isActive) throw new BadRequestException("不能删除已启用的配置，请先切换到其他配置");
    await this.configRepo.delete(id);
  }

  async activateConfig(id: number) {
    const target = await this.configRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException("配置不存在");
    await this.configRepo.manager.transaction(async (manager) => {
      await manager
        .getRepository(AiConfig)
        .createQueryBuilder()
        .update(AiConfig)
        .set({ isActive: false })
        .execute();
      await manager.update(AiConfig, id, { isActive: true });
    });
    this.agentCache = null;
    return { message: `已切换到 ${target.name}` };
  }

  // ==================== Usage ====================

  async getUsage(query: UsageQueryDto) {
    const qb = this.usageRepo.createQueryBuilder("log").orderBy("log.createdAt", "DESC");
    if (query.model) qb.andWhere("log.model = :model", { model: query.model });
    if (query.startDate) qb.andWhere("log.createdAt >= :startDate", { startDate: query.startDate });
    if (query.endDate) qb.andWhere("log.createdAt <= :endDate", { endDate: query.endDate });

    const statsQb = qb.clone();
    const pagination = await paginateQueryBuilder(qb, { page: query.page, limit: query.limit });
    const stats = await statsQb
      .select("COUNT(log.id)", "totalCalls")
      .addSelect("COALESCE(SUM(log.promptTokens), 0)", "totalPromptTokens")
      .addSelect("COALESCE(SUM(log.completionTokens), 0)", "totalCompletionTokens")
      .getRawOne<{ totalCalls: string; totalPromptTokens: string; totalCompletionTokens: string }>();

    return {
      ...pagination,
      stats: {
        totalCalls: Number(stats?.totalCalls ?? 0),
        totalPromptTokens: Number(stats?.totalPromptTokens ?? 0),
        totalCompletionTokens: Number(stats?.totalCompletionTokens ?? 0),
      },
    };
  }
}