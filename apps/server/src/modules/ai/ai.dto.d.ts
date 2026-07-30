import { PaginationQueryDto } from "../../../../../src/common";
import { AiProvider } from './ai-config.entity';
import { AiAction } from './ai-usage.entity';
export declare class SaveAiConfigDto {
    id?: number;
    name: string;
    provider: AiProvider;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
}
export declare class ChatDto {
    messages: {
        role: string;
        content: string;
    }[];
    action?: AiAction;
}
export declare class UsageQueryDto extends PaginationQueryDto {
    startDate?: string;
    endDate?: string;
    model?: string;
}
