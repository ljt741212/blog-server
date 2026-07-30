"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const openai_1 = __importDefault(require("openai"));
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const ai_config_entity_1 = require("./ai-config.entity");
const ai_usage_entity_1 = require("./ai-usage.entity");
const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 16;
const PROVIDER_DEFAULTS = {
    [ai_config_entity_1.AiProvider.OPENAI]: 'https://api.openai.com/v1',
    [ai_config_entity_1.AiProvider.DEEPSEEK]: 'https://api.deepseek.com/v1',
    [ai_config_entity_1.AiProvider.ANTHROPIC]: 'https://api.anthropic.com/v1',
};
function getEncryptionKey() {
    const raw = process.env.ENCRYPTION_KEY;
    if (!raw)
        throw new Error('ENCRYPTION_KEY is not configured');
    return node_crypto_1.default.createHash('sha256').update(raw).digest();
}
function encrypt(text) {
    const key = getEncryptionKey();
    const iv = node_crypto_1.default.randomBytes(IV_LEN);
    const cipher = node_crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}
function decrypt(encoded) {
    if (!encoded)
        return '';
    const key = getEncryptionKey();
    const parts = encoded.split(':');
    if (parts.length !== 3)
        return encoded;
    const [ivHex, tagHex, dataHex] = parts;
    const decipher = node_crypto_1.default.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, 'hex')),
        decipher.final(),
    ]);
    return decrypted.toString('utf8');
}
function maskKey(key) {
    if (key.length <= 8)
        return '****';
    return `${key.slice(0, 4)}****${key.slice(-4)}`;
}
let AiService = AiService_1 = class AiService {
    configRepo;
    usageRepo;
    logger = new common_1.Logger(AiService_1.name);
    constructor(configRepo, usageRepo) {
        this.configRepo = configRepo;
        this.usageRepo = usageRepo;
    }
    async chat(messages, action) {
        const config = await this.configRepo.findOne({ where: { isActive: true } });
        if (!config)
            throw new common_1.BadRequestException('没有启用的 AI 模型配置');
        const apiKey = decrypt(config.apiKey);
        const start = Date.now();
        const result = config.provider === ai_config_entity_1.AiProvider.ANTHROPIC
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
            action: action ?? ai_usage_entity_1.AiAction.CHAT,
        });
        return {
            content,
            model: config.model,
            usage: { promptTokens, completionTokens },
        };
    }
    async callOpenAI(config, apiKey, messages) {
        const client = new openai_1.default({
            apiKey,
            baseURL: config.baseUrl || PROVIDER_DEFAULTS[config.provider],
        });
        const resp = await client.chat.completions.create({
            model: config.model,
            messages: messages,
            max_tokens: Number(config.maxTokens),
            temperature: Number(config.temperature),
        });
        const content = resp.choices?.[0]?.message?.content ?? '';
        if (!content && !resp.choices?.length) {
            this.logger.error(`OpenAI 响应异常: ${JSON.stringify(resp)}`);
            throw new common_1.BadRequestException('AI 模型返回异常，请检查模型配置或 API 地址');
        }
        return {
            content,
            promptTokens: resp.usage?.prompt_tokens ?? 0,
            completionTokens: resp.usage?.completion_tokens ?? 0,
        };
    }
    async callAnthropic(config, apiKey, messages) {
        const systemMsg = messages.find((m) => m.role === 'system')?.content;
        const chatMessages = messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const body = {
            model: config.model,
            max_tokens: Number(config.maxTokens),
            messages: chatMessages,
        };
        if (systemMsg)
            body.system = systemMsg;
        const resp = await fetch(config.baseUrl || `${PROVIDER_DEFAULTS[config.provider]}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            const err = await resp.text();
            this.logger.error(`Anthropic API error: ${resp.status} ${err}`);
            throw new common_1.BadRequestException(`Anthropic API 调用失败: ${resp.status}`);
        }
        const data = (await resp.json());
        const text = data.content?.find((c) => c.type === 'text')?.text ?? '';
        return {
            content: text,
            promptTokens: data.usage?.input_tokens ?? 0,
            completionTokens: data.usage?.output_tokens ?? 0,
        };
    }
    async getConfigs() {
        const configs = await this.configRepo.find({
            order: { createdAt: 'DESC' },
        });
        return configs.map((c) => ({ ...c, apiKey: maskKey(decrypt(c.apiKey)) }));
    }
    async saveConfig(dto) {
        if (dto.id)
            return this.updateConfig(dto.id, dto);
        return this.createConfig(dto);
    }
    async createConfig(dto) {
        if (!dto.apiKey)
            throw new common_1.BadRequestException('API Key 为必填项');
        const config = this.configRepo.create({
            ...dto,
            apiKey: encrypt(dto.apiKey),
            isActive: false,
            maxTokens: dto.maxTokens ?? 4096,
            temperature: dto.temperature ?? 0.7,
        });
        return this.configRepo.save(config);
    }
    async updateConfig(id, dto) {
        const config = await this.configRepo.findOne({ where: { id } });
        if (!config)
            throw new common_1.NotFoundException('配置不存在');
        if (dto.apiKey) {
            dto.apiKey = encrypt(dto.apiKey);
        }
        else {
            delete dto.apiKey;
        }
        Object.assign(config, dto);
        return this.configRepo.save(config);
    }
    async deleteConfig(id) {
        const config = await this.configRepo.findOne({ where: { id } });
        if (!config)
            throw new common_1.NotFoundException('配置不存在');
        if (config.isActive)
            throw new common_1.BadRequestException('不能删除已启用的配置，请先切换到其他配置');
        await this.configRepo.delete(id);
    }
    async activateConfig(id) {
        const target = await this.configRepo.findOne({ where: { id } });
        if (!target)
            throw new common_1.NotFoundException('配置不存在');
        await this.configRepo.manager.transaction(async (manager) => {
            await manager
                .getRepository(ai_config_entity_1.AiConfig)
                .createQueryBuilder()
                .update(ai_config_entity_1.AiConfig)
                .set({ isActive: false })
                .execute();
            await manager.update(ai_config_entity_1.AiConfig, id, { isActive: true });
        });
        return { message: `已切换到 ${target.name}` };
    }
    async getUsage(query) {
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
        const pagination = await (0, common_2.paginateQueryBuilder)(qb, {
            page: query.page,
            limit: query.limit,
        });
        const stats = await statsQb
            .select('COUNT(log.id)', 'totalCalls')
            .addSelect('COALESCE(SUM(log.promptTokens), 0)', 'totalPromptTokens')
            .addSelect('COALESCE(SUM(log.completionTokens), 0)', 'totalCompletionTokens')
            .getRawOne();
        return {
            ...pagination,
            stats: {
                totalCalls: Number(stats?.totalCalls ?? 0),
                totalPromptTokens: Number(stats?.totalPromptTokens ?? 0),
                totalCompletionTokens: Number(stats?.totalCompletionTokens ?? 0),
            },
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_config_entity_1.AiConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(ai_usage_entity_1.AiUsage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiService);
//# sourceMappingURL=ai.service.js.map