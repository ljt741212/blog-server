import { CommonEntity } from "../../../../../src/common/entity/common.entity";
export declare enum AiProvider {
    OPENAI = "openai",
    DEEPSEEK = "deepseek",
    ANTHROPIC = "anthropic"
}
export declare class AiConfig extends CommonEntity {
    name: string;
    provider: AiProvider;
    model: string;
    apiKey: string;
    baseUrl: string;
    isActive: boolean;
    maxTokens: number;
    temperature: number;
}
