import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { AiMemory } from './ai-memory.entity';

export interface MemoryAddInput {
  userId: number;
  content: string;
  importance: number;
}

export interface MemorySearchInput {
  userId: number;
  query: string;
  limit: number;
}

export interface MemoryForgetInput {
  userId: number;
  strategy: 'importance_based' | 'time_based' | 'capacity_based';
  threshold?: number;
  maxAgeDays?: number;
}

@Injectable()
export class MemoryService {
  constructor(
    @InjectRepository(AiMemory)
    private readonly repo: Repository<AiMemory>,
  ) {}

  async add(input: MemoryAddInput) {
    const memory = this.repo.create({
      userId: input.userId,
      content: input.content,
      importance: input.importance,
    });
    const saved = await this.repo.save(memory);
    return { id: saved.id };
  }

  async search(input: MemorySearchInput) {
    const qb = this.repo
      .createQueryBuilder('m')
      .where('m.userId = :userId', { userId: input.userId });

    // Keyword matching on content
    const words = input.query.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      qb.andWhere(
        words.map((_, i) => `m.content LIKE :kw${i}`).join(' OR '),
        Object.fromEntries(words.map((w, i) => [`kw${i}`, `%${w}%`])),
      );
    }

    const all = await qb
      .orderBy('m.importance', 'DESC')
      .addOrderBy('m.createdAt', 'DESC')
      .take(input.limit * 3)
      .getMany();

    // Score: keyword density × importance × recency decay
    const now = Date.now();
    const scored = all.map((m) => {
      const kwScore = this.keywordScore(input.query, m.content);
      const importanceWeight = 0.8 + m.importance * 0.4;
      const hours = (now - m.createdAt.getTime()) / 3600000;
      const recency = Math.max(0.1, Math.exp((-0.1 * hours) / 24));
      const score = (kwScore * 0.7 + recency * 0.3) * importanceWeight;
      return { memory: m, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, input.limit);

    // Increment access count for matched memories
    const ids = top.map((s) => s.memory.id);
    if (ids.length) {
      await this.repo.increment({ id: In(ids) }, 'accessCount', 1);
    }

    return top.map((s) => ({
      id: s.memory.id,
      content: s.memory.content,
      importance: Number(s.memory.importance),
      createdAt: s.memory.createdAt.toISOString(),
    }));
  }

  async forget(input: MemoryForgetInput) {
    const qb = this.repo
      .createQueryBuilder()
      .delete()
      .where('userId = :uid', { uid: input.userId });

    if (input.strategy === 'importance_based') {
      qb.andWhere('importance < :threshold', {
        threshold: input.threshold ?? 0.1,
      });
    } else if (input.strategy === 'time_based') {
      const cutoff = new Date(Date.now() - (input.maxAgeDays ?? 30) * 86400000);
      qb.andWhere('createdAt < :cutoff', { cutoff });
    } else if (input.strategy === 'capacity_based') {
      // Delete lowest-importance memories beyond 200 per user
      const count = await this.repo.count({ where: { userId: input.userId } });
      if (count > 200) {
        const toDelete = await this.repo.find({
          where: { userId: input.userId },
          order: { importance: 'ASC' },
          take: count - 200,
        });
        if (toDelete.length) {
          await this.repo.remove(toDelete);
        }
        return { deleted: toDelete.length };
      }
      return { deleted: 0 };
    }

    const result = await qb.execute();
    return { deleted: result.affected ?? 0 };
  }

  async summary(userId: number) {
    const [total, avgRow] = await Promise.all([
      this.repo.count({ where: { userId } }),
      this.repo
        .createQueryBuilder('m')
        .select('AVG(m.importance)', 'avg')
        .where('m.userId = :uid', { uid: userId })
        .getRawOne<{ avg: string }>(),
    ]);
    return { total, avgImportance: Number(avgRow?.avg ?? 0).toFixed(2) };
  }

  private keywordScore(query: string, content: string): number {
    const qWords = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!qWords.length) return 0;
    const cText = content.toLowerCase();
    const hits = qWords.filter((w) => cText.includes(w)).length;
    return hits / qWords.length;
  }
}
