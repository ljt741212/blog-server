import { ChatDto, SaveAiConfigDto, UsageQueryDto } from './ai.dto';
import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(dto: ChatDto): Promise<{
        content: string;
        model: string;
        usage: {
            promptTokens: number;
            completionTokens: number;
        };
    }>;
    getConfigs(): Promise<{
        apiKey: string;
        name: string;
        provider: import("./ai-config.entity").AiProvider;
        model: string;
        baseUrl: string;
        isActive: boolean;
        maxTokens: number;
        temperature: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    saveConfig(dto: SaveAiConfigDto): Promise<import("./ai-config.entity").AiConfig>;
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
        list: import("./ai-usage.entity").AiUsage[];
        pagination: import("@/common").PaginationMeta;
    }>;
}
