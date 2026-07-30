import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, ChannelVersions, CheckpointTuple, CheckpointListOptions } from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";

export interface CheckpointRepo {
  findCheckpoint(threadId: string): Promise<{
    checkpoint: string;
    metadata: string;
    config: Record<string, unknown>;
  } | null>;
  upsertCheckpoint(data: {
    threadId: string;
    checkpoint: string;
    metadata: string;
    config: Record<string, unknown>;
  }): Promise<void>;
  deleteThread?(threadId: string): Promise<void>;
}

export class MySQLCheckpointer extends BaseCheckpointSaver {
  constructor(private readonly repo: CheckpointRepo) {
    super();
  }

  async getTuple(config: RunnableConfig) {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return undefined;

    const row = await this.repo.findCheckpoint(String(threadId));
    if (!row?.checkpoint) return undefined;

    return {
      config: row.config as RunnableConfig,
      checkpoint: JSON.parse(row.checkpoint),
      metadata: JSON.parse(row.metadata),
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

    await this.repo.upsertCheckpoint({
      threadId: String(threadId),
      checkpoint: JSON.stringify(checkpoint),
      metadata: JSON.stringify(metadata),
      config: config as Record<string, unknown>,
    });

    return config;
  }

  async putWrites(
    _config: RunnableConfig,
    _writes: unknown[],
    _taskId: string,
  ): Promise<void> {
    // writes are ephemeral — not needed for our use case
  }

  async *list(
    _config: RunnableConfig,
    _options?: CheckpointListOptions,
  ): AsyncGenerator<CheckpointTuple> {
    // not needed for our use case
  }

  async deleteThread(_threadId: string): Promise<void> {
    await this.repo.deleteThread?.(_threadId);
  }
}