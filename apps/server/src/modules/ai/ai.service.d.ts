import { Repository } from 'typeorm';
import { AiConfig, AiProvider } from './ai-config.entity';
import { AiAction, AiUsage } from './ai-usage.entity';
import { SaveAiConfigDto, UsageQueryDto } from './ai.dto';
export declare class AiService {
    private readonly configRepo;
    private readonly usageRepo;
    private readonly logger;
    constructor(configRepo: Repository<AiConfig>, usageRepo: Repository<AiUsage>);
    chat(messages: {
        role: string;
        content: string;
    }[], action?: AiAction): Promise<{
        content: string;
        model: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
    }>;
    private callOpenAI;
    private callAnthropic;
    getConfigs(): Promise<{
        apiKey: string;
        name: string;
        provider: AiProvider;
        model: string;
        baseUrl: string;
        isActive: boolean;
        maxTokens: number;
        temperature: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    saveConfig(dto: SaveAiConfigDto): Promise<AiConfig>;
    private createConfig;
    private updateConfig;
    deleteConfig(id: number): Promise<void>;
    activateConfig(id: number): Promise<{
        message: string;
    }>;
    getUsage(query: UsageQueryDto): Promise<{
        stats: {
            totalCalls: number;
            totalPromptTokens: number;
            totalCompletionTokens: number;
        };
        list: AiUsage[];
        pagination: import("@/common").PaginationMeta;
    }>;
}
