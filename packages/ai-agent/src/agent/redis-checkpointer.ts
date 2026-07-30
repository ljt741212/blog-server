import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, ChannelVersions, CheckpointTuple, CheckpointListOptions } from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";
import type { Redis } from "ioredis";

const DEFAULT_TTL = 3600; // 1 hour

export class RedisCheckpointer extends BaseCheckpointSaver {
  private readonly ttl: number;

  constructor(
    private readonly redis: Redis,
    private readonly prefix: string = "checkpoint:",
    ttl?: number,
  ) {
    super();
    this.ttl = ttl ?? DEFAULT_TTL;
  }

  private key(threadId: string) {
    return `${this.prefix}${threadId}`;
  }

  async getTuple(config: RunnableConfig) {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return undefined;

    const raw = await this.redis.get(this.key(String(threadId)));
    if (!raw) return undefined;

    const data = JSON.parse(raw);
    return {
      config: data.config as RunnableConfig,
      checkpoint: data.checkpoint,
      metadata: data.metadata,
    };
  }

  async put(
    config: RunnableConfig,
    checkpoint: Checkpoint,
    metadata: CheckpointMetadata,
    _newVersions: ChannelVersions,
  ): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return config;

    const data = {
      config,
      checkpoint,
      metadata,
    };

    await this.redis.setex(
      this.key(String(threadId)),
      this.ttl,
      JSON.stringify(data),
    );

    return config;
  }

  async putWrites(
    _config: RunnableConfig,
    _writes: unknown[],
    _taskId: string,
  ): Promise<void> {
    // writes are ephemeral
  }

  async *list(
    _config: RunnableConfig,
    _options?: CheckpointListOptions,
  ): AsyncGenerator<CheckpointTuple> {
    // not needed
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.redis.del(this.key(threadId));
  }

  async setTTL(threadId: string, ttl: number): Promise<void> {
    await this.redis.expire(this.key(threadId), ttl);
  }
}