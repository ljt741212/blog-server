import crypto from 'node:crypto';

import {
  createAgent,
  createEditorAgent,
  RedisCheckpointer,
  SYSTEM_PROMPT,
  ARTICLE_EDITOR_PROMPT,
  HumanMessage,
  SystemMessage,
  AIMessage,
  BaseMessage,
  Command,
  createChatModel,
  type ToolServices,
  type EditorToolServices,
} from '@blog/ai-agent';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { paginateQueryBuilder, paginateQueryBuilderForAdmin } from '@/common';
import { AnnouncementService } from '@/modules/announcement/announcement.service';
import { CategoryService } from '@/modules/category/category.service';
import { ChangelogService } from '@/modules/changelog/changelog.service';
import { CommentStatus } from '@/modules/comment/comment.entity';
import { CommentService } from '@/modules/comment/comment.service';
import { DataTransferService } from '@/modules/data-transfer/data-transfer.service';
import { FriendLinkService } from '@/modules/friend-link/friend-link.service';
import { GuestMessageService } from '@/modules/guest-message/guest-message.service';
import { IcpInfoService } from '@/modules/icp-info/icp-info.service';
import { OssService } from '@/modules/oss/oss.service';
import { PostStatus } from '@/modules/post/post.entity';
import { PostService } from '@/modules/post/post.service';
import { SeoSettingService } from '@/modules/seo-setting/seo-setting.service';
import { SettingService } from '@/modules/setting/setting.service';
import { SiteConfigService } from '@/modules/site-config/site-config.service';
import { TagService } from '@/modules/tag/tag.service';
import { VisitorService } from '@/modules/visitor/visitor.service';

import { AiConfig } from './ai-config.entity';
import { AiAction, AiUsage } from './ai-usage.entity';
import { EditorStateDto, SaveAiConfigDto, UsageQueryDto } from './ai.dto';
import { Conversation, type ConversationMessage } from './conversation.entity';
import { MemoryService } from './memory.service';

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// ---- SSE Emitter ----

export interface SseEmitter {
  emitToken(content: string): void;
  emitToolCall(toolName: string, args: Record<string, unknown>): void;
  emitToolResult(toolName: string, result: unknown): void;
  emitConfirm(
    toolName: string,
    args: Record<string, unknown>,
    message: string,
  ): void;
  emitDone(threadId?: string): void;
  emitError(message: string): void;
}

// ---- Encryption ----

const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error('ENCRYPTION_KEY is not configured');
  return crypto.createHash('sha256').update(raw).digest();
}

function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(encoded: string): string {
  if (!encoded) return '';
  const key = getEncryptionKey();
  const parts = encoded.split(':');
  if (parts.length !== 3) return encoded;
  const [ivHex, tagHex, dataHex] = parts;
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, 'hex'),
  );
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

function maskKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

// ---- Service ----

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private agentCache: {
    configId: number;
    agent: ReturnType<typeof createAgent>;
  } | null = null;
  private tempAgentCache: {
    configId: number;
    agent: ReturnType<typeof createAgent>;
  } | null = null;
  private editorAgentCache: {
    configId: number;
    agent: ReturnType<typeof createAgent>;
  } | null = null;
  private redis: Redis | null = null;
  private requestAuth: string = '';
  private requestUserId: number = 0;

  constructor(
    @InjectRepository(AiConfig)
    private readonly configRepo: Repository<AiConfig>,
    @InjectRepository(AiUsage) private readonly usageRepo: Repository<AiUsage>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
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
    private readonly memoryService: MemoryService,
  ) {}

  // ==================== Agent Chat ====================

  async handleChat(
    message: string,
    conversationId: string | null,
    userId: number,
    authHeader: string,
    sseEmitter: SseEmitter,
    temporary: boolean = false,
  ) {
    this.requestAuth = authHeader;
    this.requestUserId = userId;
    const startTime = Date.now();

    // Input validation: reject messages over 8000 chars (~2000 tokens)
    if (message.length > 8000) {
      sseEmitter.emitError('消息过长，请控制在 8000 字以内');
      return;
    }

    if (temporary) {
      return this.handleTemporaryChat(message, conversationId, sseEmitter);
    }

    const numId = conversationId ? Number(conversationId) : null;

    const conversation = await this.getOrCreateConversation(numId, userId);
    const agent = await this.getOrCreateAgent();
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });
    const activeConfigId = activeConfig?.id;

    const isNew = !conversation.checkpoint;
    const messages: BaseMessage[] = isNew
      ? [new SystemMessage(SYSTEM_PROMPT), new HumanMessage(message)]
      : [new HumanMessage(message)];

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
        handleLLMEnd(output: unknown) {
          const llmOutput = output as {
            generations?: {
              [k: number]: {
                [k: number]: {
                  message?: {
                    usage_metadata?: {
                      input_tokens?: number;
                      output_tokens?: number;
                    };
                  };
                };
              };
            };
          };
          const usage =
            llmOutput?.generations?.[0]?.[0]?.message?.usage_metadata;
          if (usage) {
            totalInputTokens += usage.input_tokens ?? 0;
            totalOutputTokens += usage.output_tokens ?? 0;
          }
        },
      },
    ];

    try {
      const stream = await agent.stream(
        { messages },
        {
          configurable: { thread_id: String(conversation.id), sseEmitter },
          callbacks,
        },
      );

      const streamMessages: BaseMessage[] = [];
      for await (const rawChunk of stream) {
        if (rawChunk == null) continue;
        const chunk: unknown = Array.isArray(rawChunk)
          ? (rawChunk[2] ?? rawChunk[1] ?? rawChunk)
          : rawChunk;
        const msgs = this.extractMessagesFromChunk(
          chunk as Record<string, unknown>,
        );
        if (msgs.length > 0) streamMessages.push(...msgs);
      }

      const allNewMessages = [...messages, ...streamMessages];
      await this.persistMessages(conversation.id, allNewMessages);

      if (!conversation.title) {
        setImmediate(() => {
          void this.generateTitle(conversation.id, message);
        });
      }

      sseEmitter.emitDone();
    } catch (err: unknown) {
      this.logger.error(`Agent stream error: ${errMsg(err)}`);
      sseEmitter.emitError(errMsg(err) || 'AI 处理出错，请重试');
    } finally {
      // Persist usage regardless of success/failure
      if ((totalInputTokens > 0 || totalOutputTokens > 0) && activeConfigId) {
        setImmediate(() => {
          void this.usageRepo
            .save({
              configId: activeConfigId,
              model: activeConfig?.model ?? '',
              promptTokens: totalInputTokens,
              completionTokens: totalOutputTokens,
              latencyMs: Date.now() - startTime,
              action: AiAction.CHAT,
            } as AiUsage)
            .catch(() => {});
        });
      }
    }
  }

  private async handleTemporaryChat(
    message: string,
    threadId: string | null,
    sseEmitter: SseEmitter,
  ) {
    const agent = await this.getOrCreateTempAgent();
    const id =
      threadId ??
      `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const messages: BaseMessage[] = threadId
      ? [new HumanMessage(message)]
      : [new SystemMessage(SYSTEM_PROMPT), new HumanMessage(message)];

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
      },
    ];

    try {
      const stream = await agent.stream(
        { messages },
        {
          configurable: { thread_id: id, sseEmitter },
          callbacks,
        },
      );

      for await (const _unused of stream) {
        void _unused;
        // SSE events emitted via callbacks and node-internal sseEmitter
      }

      sseEmitter.emitDone(id);
    } catch (err: unknown) {
      this.logger.error(`Temp agent stream error: ${errMsg(err)}`);
      sseEmitter.emitError(errMsg(err) || 'AI 处理出错，请重试');
    }
  }

  async handleConfirm(
    conversationId: number,
    confirm: boolean,
    sseEmitter: SseEmitter,
  ) {
    const agent = await this.getOrCreateAgent();

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
      },
    ];

    try {
      const stream = await agent.stream(new Command({ resume: { confirm } }), {
        configurable: { thread_id: String(conversationId), sseEmitter },
        callbacks,
      });

      const streamMessages: BaseMessage[] = [];
      for await (const rawChunk of stream) {
        if (rawChunk == null) continue;
        const chunk: unknown = Array.isArray(rawChunk)
          ? (rawChunk[2] ?? rawChunk[1] ?? rawChunk)
          : rawChunk;
        const msgs = this.extractMessagesFromChunk(
          chunk as Record<string, unknown>,
        );
        if (msgs.length > 0) streamMessages.push(...msgs);
      }

      await this.persistMessages(conversationId, streamMessages);
      sseEmitter.emitDone();
    } catch (err: unknown) {
      this.logger.error(`Confirm stream error: ${errMsg(err)}`);
      sseEmitter.emitError(errMsg(err) || 'AI 处理出错，请重试');
    }
  }

  // ==================== Agent Factory ====================

  private async getOrCreateAgent() {
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });
    if (!activeConfig)
      throw new BadRequestException('没有启用的 AI 模型配置，请先在后台配置');

    if (this.agentCache?.configId === activeConfig.id) {
      return this.agentCache.agent;
    }

    const agent = createAgent({
      llmConfig: {
        provider: activeConfig.provider,
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: activeConfig.maxTokens,
        temperature: Number(activeConfig.temperature),
      },
      services: this.buildToolServices(),
      dangerousToolNames: [
        'delete_post',
        'delete_category',
        'delete_tag',
        'delete_comment',
        'delete_friend_link',
        'delete_guest_message',
        'delete_announcement',
        'delete_changelog',
        'import_data',
      ],
      checkpointer: new RedisCheckpointer(
        this.getRedis(),
        'conv_checkpoint:',
        86400 * 7,
      ),
    });

    this.agentCache = { configId: activeConfig.id, agent };
    return agent;
  }

  private getRedis(): Redis {
    if (!this.redis) {
      this.redis = new Redis({
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
      });
    }
    return this.redis;
  }

  private async getOrCreateTempAgent() {
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });
    if (!activeConfig)
      throw new BadRequestException('没有启用的 AI 模型配置，请先在后台配置');

    if (this.tempAgentCache?.configId === activeConfig.id) {
      return this.tempAgentCache.agent;
    }

    const agent = createAgent({
      llmConfig: {
        provider: activeConfig.provider,
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: activeConfig.maxTokens,
        temperature: Number(activeConfig.temperature),
      },
      services: this.buildToolServices(),
      dangerousToolNames: [
        'delete_post',
        'delete_category',
        'delete_tag',
        'delete_comment',
        'delete_friend_link',
        'delete_guest_message',
        'delete_announcement',
        'delete_changelog',
        'import_data',
      ],
      checkpointer: new RedisCheckpointer(
        this.getRedis(),
        'temp_checkpoint:',
        3600,
      ),
    });

    this.tempAgentCache = { configId: activeConfig.id, agent };
    return agent;
  }

  private buildToolServices(): ToolServices {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const asDto = <T>(args: Record<string, unknown>): T => args as unknown as T;
    const auth = () => this.requestAuth;
    const getUserId = () => this.requestUserId;

    return {
      getUserId,
      postService: {
        findPage: (args) => this.postService.paginateForAdmin(asDto(args)),
        findOne: (id) => this.postService.findOne(id),
        create: (args) => this.postService.create(asDto(args), auth()),
        update: (id, args) => this.postService.update(id, asDto(args)),
        delete: (id) => this.postService.remove(id),
        publish: (id) =>
          this.postService.updateStatus(id, PostStatus.PUBLISHED),
        unpublish: (id) => this.postService.updateStatus(id, PostStatus.DRAFT),
        top: (id) => this.postService.updateTop(id, true),
        untop: (id) => this.postService.updateTop(id, false),
      },
      categoryService: {
        findAll: () => this.categoryService.findAll(),
        create: (args) => this.categoryService.create(asDto(args)),
        update: (id, args) => this.categoryService.update(id, asDto(args)),
        delete: (id) => this.categoryService.remove(id),
      },
      tagService: {
        findAll: () => this.tagService.findAll(),
        create: (args) => this.tagService.create(asDto(args)),
        update: (id, args) => this.tagService.update(id, asDto(args)),
        delete: (id) => this.tagService.remove(id),
      },
      commentService: {
        findPage: (args) => this.commentService.paginateForAdmin(asDto(args)),
        approve: (id) =>
          this.commentService.updateStatus(id, CommentStatus.APPROVED),
        reject: (id) =>
          this.commentService.updateStatus(id, CommentStatus.REJECTED),
        reply: (id, content) =>
          this.commentService.create(
            asDto({ content, postId: 0, parentId: id }),
          ),
        delete: (id) => this.commentService.remove(id),
      },
      friendLinkService: {
        findAll: (status) =>
          this.friendLinkService.findAll(
            status as Parameters<FriendLinkService['findAll']>[0],
          ),
        approve: (id) =>
          this.friendLinkService.updateStatus(
            id,
            asDto({ status: 'approved' }),
          ),
        reject: (id) =>
          this.friendLinkService.updateStatus(
            id,
            asDto({ status: 'rejected' }),
          ),
        delete: (id) => this.friendLinkService.remove(id),
      },
      guestMessageService: {
        findPage: (args) =>
          this.guestMessageService.paginateForAdmin(asDto(args)),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reply: (id, _content) =>
          this.guestMessageService.updateStatus(
            id,
            'replied' as Parameters<GuestMessageService['updateStatus']>[1],
          ),
        delete: (id) => this.guestMessageService.remove(id),
      },
      announcementService: {
        findPage: (args) =>
          this.announcementService.paginateForAdmin(asDto(args)),
        create: (args) => this.announcementService.create(asDto(args)),
        delete: (id) => this.announcementService.remove(id),
      },
      changelogService: {
        findPage: (args) => this.changelogService.paginateForAdmin(asDto(args)),
        create: (args) => this.changelogService.create(asDto(args)),
        delete: (id) => this.changelogService.remove(id),
      },
      siteConfigService: {
        get: () => this.siteConfigService.get(),
        update: (args) => this.siteConfigService.save(asDto(args)),
      },
      seoSettingService: {
        getLatest: () => this.seoSettingService.getSeoSetting(),
        create: (args) => this.seoSettingService.save(asDto(args)),
      },
      icpInfoService: {
        getLatest: () => this.icpInfoService.getLatest(),
        create: (args) => this.icpInfoService.save(asDto(args)),
      },
      settingService: {
        getAll: () => this.settingService.getAll(),
        save: (dto) => this.settingService.save(asDto(dto)),
      },
      visitorService: {
        getDashboardStats: () => this.visitorService.getDashboardStats(),
        paginateForAdmin: (args) =>
          this.visitorService.paginateForAdmin(asDto(args)),
        getOnlineStats: () => this.visitorService.getOnlineStats(),
      },
      dataTransferService: {
        exportAllToZip: () =>
          this.dataTransferService.exportAllToZip(asDto({})),
        importAllFromZip: (data) =>
          this.dataTransferService.importAllFromZip(
            data,
            asDto({ clearExisting: true }),
          ),
      },
      ossService: {
        signUrl: (key) => this.ossService.signUrl(key),
      },
      redisService: {
        get: (key) => this.getRedis().get(key),
        set: (key, value, ttlSeconds) => {
          if (ttlSeconds) {
            return this.getRedis()
              .setex(key, ttlSeconds, value)
              .then(() => {});
          }
          return this.getRedis()
            .set(key, value)
            .then(() => {});
        },
        del: (key) =>
          this.getRedis()
            .del(key)
            .then(() => {}),
        keys: (pattern) => this.getRedis().keys(pattern),
      },
      memoryService: {
        add: (input) => this.memoryService.add(input),
        search: (input) => this.memoryService.search(input),
        forget: (input) => this.memoryService.forget(input),
        summary: (userId) => this.memoryService.summary(userId),
      },
    };
  }

  // ==================== Editor Agent ====================

  async handleEditorChat(
    message: string | undefined,
    editorState: EditorStateDto | undefined,
    conversationId: number | null,
    userId: number,
    sseEmitter: SseEmitter,
  ) {
    this.requestUserId = userId;
    const startTime = Date.now();

    const effectiveMessage =
      message?.trim() || '请根据编辑器中的内容，帮我优化和推荐。';

    if (effectiveMessage.length > 8000) {
      sseEmitter.emitError('消息过长，请控制在 8000 字以内');
      return;
    }

    const conversation = await this.getOrCreateConversation(
      conversationId,
      userId,
    );
    const agent = await this.getOrCreateEditorAgent();
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });
    const activeConfigId = activeConfig?.id;

    const editorContext = this.formatEditorContext(editorState);
    const userMessage = `${editorContext}\n\n---\n用户消息：${effectiveMessage}\n\n（你必须调用工具来响应。写作操作调用对应工具，闲聊用 reply_to_user。）`;
    const isNew = !conversation.checkpoint;

    const messages: BaseMessage[] = isNew
      ? [
          new SystemMessage(ARTICLE_EDITOR_PROMPT),
          new HumanMessage(userMessage),
        ]
      : [new HumanMessage(userMessage)];

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
        handleLLMEnd(output: unknown) {
          const llmOutput = output as {
            generations?: {
              [k: number]: {
                [k: number]: {
                  message?: {
                    usage_metadata?: {
                      input_tokens?: number;
                      output_tokens?: number;
                    };
                  };
                };
              };
            };
          };
          const usage =
            llmOutput?.generations?.[0]?.[0]?.message?.usage_metadata;
          if (usage) {
            totalInputTokens += usage.input_tokens ?? 0;
            totalOutputTokens += usage.output_tokens ?? 0;
          }
        },
      },
    ];

    try {
      const stream = await agent.stream(
        { messages },
        {
          configurable: { thread_id: String(conversation.id), sseEmitter },
          callbacks,
          recursionLimit: 10,
        },
      );

      const streamMessages: BaseMessage[] = [];
      for await (const rawChunk of stream) {
        if (rawChunk == null) continue;
        const chunk: unknown = Array.isArray(rawChunk)
          ? (rawChunk[2] ?? rawChunk[1] ?? rawChunk)
          : rawChunk;
        const msgs = this.extractMessagesFromChunk(
          chunk as Record<string, unknown>,
        );
        if (msgs.length > 0) streamMessages.push(...msgs);
      }

      const allNewMessages = [...messages, ...streamMessages];
      await this.persistMessages(conversation.id, allNewMessages);

      if (!conversation.title) {
        setImmediate(() => {
          void this.generateTitle(conversation.id, effectiveMessage);
        });
      }

      sseEmitter.emitDone();
    } catch (err: unknown) {
      if ((err as { code?: string }).code === 'RECURSION_LIMIT') {
        sseEmitter.emitDone();
        return;
      }
      this.logger.error(`Editor agent stream error: ${errMsg(err)}`);
      sseEmitter.emitError(errMsg(err) || 'AI 处理出错，请重试');
    } finally {
      if ((totalInputTokens > 0 || totalOutputTokens > 0) && activeConfigId) {
        setImmediate(() => {
          void this.usageRepo
            .save({
              configId: activeConfigId,
              model: activeConfig?.model ?? '',
              promptTokens: totalInputTokens,
              completionTokens: totalOutputTokens,
              latencyMs: Date.now() - startTime,
              action: AiAction.CHAT,
            } as AiUsage)
            .catch(() => {});
        });
      }
    }
  }

  async handleEditorConfirm(
    conversationId: number,
    confirm: boolean,
    sseEmitter: SseEmitter,
  ) {
    const agent = await this.getOrCreateEditorAgent();

    const callbacks = [
      {
        handleLLMNewToken(token: string) {
          sseEmitter.emitToken(token);
        },
      },
    ];

    try {
      const stream = await agent.stream(new Command({ resume: { confirm } }), {
        configurable: { thread_id: String(conversationId), sseEmitter },
        callbacks,
        recursionLimit: 10,
      });

      const streamMessages: BaseMessage[] = [];
      for await (const rawChunk of stream) {
        if (rawChunk == null) continue;
        const chunk: unknown = Array.isArray(rawChunk)
          ? (rawChunk[2] ?? rawChunk[1] ?? rawChunk)
          : rawChunk;
        const msgs = this.extractMessagesFromChunk(
          chunk as Record<string, unknown>,
        );
        if (msgs.length > 0) streamMessages.push(...msgs);
      }

      await this.persistMessages(conversationId, streamMessages);
      sseEmitter.emitDone();
    } catch (err: unknown) {
      this.logger.error(`Editor confirm stream error: ${errMsg(err)}`);
      sseEmitter.emitError(errMsg(err) || 'AI 处理出错，请重试');
    }
  }

  private async getOrCreateEditorAgent() {
    const activeConfig = await this.configRepo.findOne({
      where: { isActive: true },
    });
    if (!activeConfig)
      throw new BadRequestException('没有启用的 AI 模型配置，请先在后台配置');

    if (this.editorAgentCache?.configId === activeConfig.id) {
      return this.editorAgentCache.agent;
    }

    const agent = createEditorAgent({
      llmConfig: {
        provider: activeConfig.provider,
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: activeConfig.maxTokens,
        temperature: Number(activeConfig.temperature),
      },
      services: this.buildEditorToolServices(),
      checkpointer: new RedisCheckpointer(
        this.getRedis(),
        'editor_checkpoint:',
        86400 * 7,
      ),
    });

    this.editorAgentCache = { configId: activeConfig.id, agent };
    return agent;
  }

  private buildEditorToolServices(): EditorToolServices {
    return {
      categoryService: {
        findAll: () => this.categoryService.findAll(),
      },
      tagService: {
        findAll: () => this.tagService.findAll(),
      },
    };
  }

  private formatEditorContext(state?: EditorStateDto): string {
    return `[当前编辑器状态]
标题: ${state?.title || '(空)'}
内容: ${state?.content || '(空)'}
摘要: ${state?.summary || '(空)'}
分类: ${state?.categoryName || '(空)'}
标签: ${state?.tagNames?.join(', ') || '(空)'}
封面图: ${state?.coverImage || '(空)'}`;
  }

  // ==================== Conversation ====================

  private async getOrCreateConversation(
    conversationId: number | null,
    userId: number,
  ) {
    if (conversationId) {
      const conv = await this.conversationRepo.findOne({
        where: { id: conversationId, userId },
      });
      if (!conv) throw new NotFoundException('会话不存在');
      return conv;
    }
    const conv = this.conversationRepo.create({ userId, messages: [] });
    return this.conversationRepo.save(conv);
  }

  async getConversations(userId: number, page = 1, limit = 20) {
    const qb = this.conversationRepo
      .createQueryBuilder('c')
      .where('c.userId = :userId', { userId })
      .orderBy('c.updatedAt', 'DESC');
    const result = await paginateQueryBuilderForAdmin(qb, { page, limit });
    return {
      ...result,
      items: result.items.map((c: Conversation) => ({
        id: c.id,
        title: c.title ?? '新对话',
        lastMessagePreview: this.getLastMessagePreview(c),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    };
  }

  async getConversation(id: number, userId: number) {
    const conv = await this.conversationRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('会话不存在');
    return conv;
  }

  async deleteConversation(id: number, userId: number) {
    const conv = await this.conversationRepo.findOne({ where: { id, userId } });
    if (!conv) throw new NotFoundException('会话不存在');
    await this.conversationRepo.remove(conv);
  }

  private getLastMessagePreview(conv: Conversation): string {
    const msgs = conv.messages ?? [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      if (msg.role === 'system') continue;

      if (msg.content && msg.content.trim()) {
        return msg.content.slice(0, 50);
      }

      if (msg.toolCalls && msg.toolCalls.length > 0) {
        return `[调用工具: ${msg.toolCalls[0].name}]`;
      }

      if (msg.role === 'tool') {
        return '[工具返回]';
      }
    }
    return '';
  }

  private async persistMessages(
    conversationId: number,
    newMessages: BaseMessage[],
  ) {
    try {
      const newFormatted = this.toConversationMessages(newMessages);

      const conv = await this.conversationRepo.findOne({
        where: { id: conversationId },
        select: ['messages'],
      });
      const existing = conv?.messages ?? [];
      const combined = [...existing, ...newFormatted];

      await this.conversationRepo.update({ id: conversationId }, {
        messages: combined,
        updatedAt: new Date(),
      } as Parameters<typeof this.conversationRepo.update>[1]);

      try {
        const redis = this.getRedis();
        await redis.setex(
          `conversation:messages:${conversationId}`,
          86400,
          JSON.stringify(combined.slice(-20)),
        );
      } catch {
        // Redis is optional for persistent conversations
      }
    } catch (err: unknown) {
      this.logger.warn(`persistMessages 失败 (非关键): ${errMsg(err)}`);
    }
  }

  private mapMessageRole(m: BaseMessage): string {
    const type = m._getType?.() ?? m.getType?.() ?? '';
    if (type === 'human' || type === 'user') return 'user';
    if (type === 'ai' || type === 'assistant') return 'assistant';
    if (type === 'tool') return 'tool';
    if (type === 'system') return 'system';
    return 'assistant';
  }

  private extractMessagesFromChunk(
    chunk: Record<string, unknown>,
  ): BaseMessage[] {
    for (const nodeName of Object.keys(chunk)) {
      const update = chunk[nodeName];
      if (update == null || typeof update !== 'object') continue;
      if (Array.isArray(update)) return update as BaseMessage[];
      const val = update as Record<string, unknown>;
      // { messages: [...] } at top level ("values" mode)
      if (Array.isArray(val.messages)) return val.messages as BaseMessage[];
      // { nodeName: { messages: [...] } } ("updates" mode)
      for (const innerKey of Object.keys(val)) {
        const inner = val[innerKey];
        if (
          inner != null &&
          typeof inner === 'object' &&
          Array.isArray((inner as Record<string, unknown>).messages)
        ) {
          return (inner as Record<string, unknown>).messages as BaseMessage[];
        }
      }
    }
    return [];
  }

  private toConversationMessages(
    rawMessages: BaseMessage[],
  ): ConversationMessage[] {
    return rawMessages
      .filter((m) => m != null)
      .map((m) => {
        const role = this.mapMessageRole(m);
        const entry: ConversationMessage = {
          role: role as ConversationMessage['role'],
          content:
            typeof m.content === 'string'
              ? m.content
              : JSON.stringify(m.content ?? ''),
          createdAt: new Date().toISOString(),
        };

        if (role === 'assistant') {
          const tc = (m as AIMessage).tool_calls;
          if (tc && tc.length > 0) {
            entry.toolCalls = tc.map((t) => ({
              name: t.name ?? '',
              args: t.args ?? {},
              id: t.id ?? '',
            }));
          }
        }

        return entry;
      });
  }

  private async generateTitle(
    conversationId: number,
    firstUserMessage: string,
  ) {
    try {
      const conv = await this.conversationRepo.findOne({
        where: { id: conversationId },
        select: ['title'],
      });
      if (!conv || conv.title) return;

      const activeConfig = await this.configRepo.findOne({
        where: { isActive: true },
      });
      if (!activeConfig) return;

      const model = createChatModel({
        provider: activeConfig.provider,
        model: activeConfig.model,
        apiKey: decrypt(activeConfig.apiKey),
        baseUrl: activeConfig.baseUrl,
        maxTokens: 50,
        temperature: 0.3,
      });

      const resp = await model.invoke([
        new SystemMessage(
          '为以下对话生成简短标题（10字以内），直接输出标题，不要加引号、标点或解释。',
        ),
        new HumanMessage(firstUserMessage.slice(0, 200)),
      ]);

      const title = (resp.content as string).trim().slice(0, 50);

      await this.conversationRepo.update({ id: conversationId }, { title });
    } catch (error: unknown) {
      this.logger.warn(`生成会话标题失败: ${errMsg(error)}`);
    }
  }

  // ==================== Config CRUD ====================

  async getConfigs() {
    const configs = await this.configRepo.find({
      order: { createdAt: 'DESC' },
    });
    return configs.map((c) => ({ ...c, apiKey: maskKey(decrypt(c.apiKey)) }));
  }

  async saveConfig(dto: SaveAiConfigDto) {
    if (dto.id) return this.updateConfig(dto.id, dto);
    return this.createConfig(dto);
  }

  private async createConfig(dto: SaveAiConfigDto) {
    if (!dto.apiKey) throw new BadRequestException('API Key 为必填项');
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
    if (!config) throw new NotFoundException('配置不存在');
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
    if (!config) throw new NotFoundException('配置不存在');
    if (config.isActive)
      throw new BadRequestException('不能删除已启用的配置，请先切换到其他配置');
    await this.configRepo.delete(id);
  }

  async activateConfig(id: number) {
    const target = await this.configRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException('配置不存在');
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
    this.tempAgentCache = null;
    this.editorAgentCache = null;
    return { message: `已切换到 ${target.name}` };
  }

  // ==================== Usage ====================

  async getUsage(query: UsageQueryDto) {
    const qb = this.usageRepo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');
    if (query.model) qb.andWhere('log.model = :model', { model: query.model });
    if (query.startDate)
      qb.andWhere('log.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    if (query.endDate)
      qb.andWhere('log.createdAt <= :endDate', { endDate: query.endDate });

    const statsQb = qb.clone();
    const pagination = await paginateQueryBuilder(qb, {
      page: query.page,
      limit: query.limit,
    });
    const stats = await statsQb
      .select('COUNT(log.id)', 'totalCalls')
      .addSelect('COALESCE(SUM(log.promptTokens), 0)', 'totalPromptTokens')
      .addSelect(
        'COALESCE(SUM(log.completionTokens), 0)',
        'totalCompletionTokens',
      )
      .getRawOne<{
        totalCalls: string;
        totalPromptTokens: string;
        totalCompletionTokens: string;
      }>();

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
