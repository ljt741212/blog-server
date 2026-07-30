import { BaseEntity } from 'typeorm';
export declare enum AiAction {
    CONTINUE_WRITE = "continue_write",
    POLISH = "polish",
    SUMMARY = "summary",
    TITLE = "title",
    ARTICLE_ADVICE = "article_advice",
    CHAT = "chat"
}
export declare class AiUsage extends BaseEntity {
    id: number;
    configId: number;
    model: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    action: AiAction;
    createdAt: Date;
}
