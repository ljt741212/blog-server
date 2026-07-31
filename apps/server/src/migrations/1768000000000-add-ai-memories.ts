import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class AddAiMemories1768000000000 implements MigrationInterface {
  name = 'AddAiMemories1768000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_memories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'user_id', type: 'int', comment: '所属用户' },
          { name: 'content', type: 'text', comment: '记忆内容' },
          {
            name: 'importance',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: '0.50',
            comment: '重要性 0-1',
          },
          {
            name: 'access_count',
            type: 'int',
            default: '0',
            comment: '被搜索命中次数',
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'ai_memories',
      new TableIndex({ name: 'IDX_memories_user', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'ai_memories',
      new TableIndex({
        name: 'IDX_memories_importance',
        columnNames: ['importance'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_memories');
  }
}
