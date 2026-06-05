import crypto from 'node:crypto';

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Repository } from 'typeorm';

import { paginateQueryBuilder } from '@/common';

import { AiConfig, AiProvider } from './ai-config.entity';
import { AiAction, AiUsage } from './ai-usage.entity';
import { SaveAiConfigDto, UsageQueryDto } from './ai.dto';

const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 16;

const PROVIDER_DEFAULTS: Record<AiProvider, string> = {
  [AiProvider.OPENAI]: 'https://api.openai.com/v1',
  [AiProvider.DEEPSEEK]: 'https://api.deepseek.com/v1',
  [AiProvider.ANTHROPIC]: 'https://api.anthropic.com/v1',
};

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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @InjectRepository(AiConfig)
    private readonly configRepo: Repository<AiConfig>,
    @InjectRepository(AiUsage)
    private readonly usageRepo: Repository<AiUsage>,
  ) {}

  // ==================== Chat ====================

  async chat(messages: { role: string; content: string }[], action?: AiAction) {
    const config = await this.configRepo.findOne({ where: { isActive: true } });
    if (!config) throw new BadRequestException('没有启用的 AI 模型配置');

    const apiKey = decrypt(config.apiKey);
    const start = Date.now();

    const result =
      config.provider === AiProvider.ANTHROPIC
        ? await this.callAnthropic(config, apiKey, messages)
        : await this.callOpenAI(config, apiKey, messages);
    const { content, promptTokens, completionTokens } = result;

    const latencyMs = Date.now() - start;

    await this.usageRepo.save({
      configId: config.id,
      model: config.model,
      promptTokens,
      completionTokens,
      latencyMs,
      action: action ?? AiAction.CHAT,
    });

    return {
      content,
      model: config.model,
      usage: { promptTokens, completionTokens },
    };
  }

  private async callOpenAI(
    config: AiConfig,
    apiKey: string,
    messages: { role: string; content: string }[],
  ) {
    const client = new OpenAI({
      apiKey,
      baseURL: config.baseUrl || PROVIDER_DEFAULTS[config.provider],
    });

    const resp = await client.chat.completions.create({
      model: config.model,
      messages:
        messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      max_tokens: Number(config.maxTokens),
      temperature: Number(config.temperature),
    });

    const content = resp.choices?.[0]?.message?.content ?? '';

    if (!content && !resp.choices?.length) {
      this.logger.error(`OpenAI 响应异常: ${JSON.stringify(resp)}`);
      throw new BadRequestException(
        'AI 模型返回异常，请检查模型配置或 API 地址',
      );
    }

    return {
      content,
      promptTokens: resp.usage?.prompt_tokens ?? 0,
      completionTokens: resp.usage?.completion_tokens ?? 0,
    };
  }

  private async callAnthropic(
    config: AiConfig,
    apiKey: string,
    messages: { role: string; content: string }[],
  ) {
    const systemMsg = messages.find((m) => m.role === 'system')?.content;
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const body: Record<string, unknown> = {
      model: config.model,
      max_tokens: Number(config.maxTokens),
      messages: chatMessages,
    };
    if (systemMsg) body.system = systemMsg;

    const resp = await fetch(
      config.baseUrl || `${PROVIDER_DEFAULTS[config.provider]}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      },
    );

    if (!resp.ok) {
      const err = await resp.text();
      this.logger.error(`Anthropic API error: ${resp.status} ${err}`);
      throw new BadRequestException(`Anthropic API 调用失败: ${resp.status}`);
    }

    const data = (await resp.json()) as {
      content?: { type: string; text: string }[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const text = data.content?.find((c) => c.type === 'text')?.text ?? '';

    return {
      content: text,
      promptTokens: data.usage?.input_tokens ?? 0,
      completionTokens: data.usage?.output_tokens ?? 0,
    };
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

    return { message: `已切换到 ${target.name}` };
  }

  // ==================== Usage ====================

  async getUsage(query: UsageQueryDto) {
    const qb = this.usageRepo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (query.model) {
      qb.andWhere('log.model = :model', { model: query.model });
    }
    if (query.startDate) {
      qb.andWhere('log.createdAt >= :startDate', {
        startDate: query.startDate,
      });
    }
    if (query.endDate) {
      qb.andWhere('log.createdAt <= :endDate', { endDate: query.endDate });
    }

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
