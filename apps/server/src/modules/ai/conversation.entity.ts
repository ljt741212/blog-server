import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("ai_conversations")
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200, nullable: true, comment: "AI 自动生成的标题" })
  title: string;

  @Column({ name: "user_id", type: "int", comment: "所属用户" })
  userId: number;

  @Column({ type: "json", nullable: true, comment: "完整消息历史" })
  messages: ConversationMessage[];

  @Column({ type: "text", nullable: true, comment: "LangGraph checkpoint 序列化数据" })
  checkpoint: string;

  @Column({ type: "json", nullable: true, comment: "Checkpoint metadata" })
  checkpointMetadata: string;

  @Column({ type: "json", nullable: true, comment: "Checkpoint config" })
  checkpointConfig: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}

export interface ConversationMessage {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolCalls?: { name: string; args: Record<string, unknown>; id: string }[];
  toolResult?: { name: string; result: unknown };
  createdAt: string;
}