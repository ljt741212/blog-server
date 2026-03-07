import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, MoreThanOrEqual, Repository } from 'typeorm';

import { Category } from '@/modules/category/category.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { Post } from '@/modules/post/post.entity';

import { TrackVisitDto } from './dto/track-visit.dto';
import { OnlineStreamService } from './online-stream.service';
import { VisitorLog } from './visitor-log.entity';
import { Visitor } from './visitor.entity';

import type { Request } from 'express';

@Injectable()
export class VisitorService {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorRepo: Repository<Visitor>,
    @InjectRepository(VisitorLog)
    private readonly visitorLogRepo: Repository<VisitorLog>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject(forwardRef(() => OnlineStreamService))
    private readonly onlineStream: OnlineStreamService,
  ) {}

  async recordVisit(dto: TrackVisitDto, req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp =
      (typeof forwarded === 'string' ? forwarded : '') ||
      (req.ip ?? '') ||
      (req.socket?.remoteAddress ?? '') ||
      '';

    const ip = rawIp.split(',')[0].trim();

    const userAgent =
      dto.userAgent || (req.headers['user-agent'] as string) || '';

    let visitor: Visitor | null = null;

    if (dto.visitorId) {
      visitor = await this.visitorRepo.findOne({
        where: [{ visitorId: dto.visitorId }, { fingerprint: dto.visitorId }],
      });
    }

    if (!visitor) {
      visitor = await this.visitorRepo.findOne({ where: { ip } });
    }

    const now = new Date();
    if (!visitor) {
      visitor = this.visitorRepo.create({
        visitorId: dto.visitorId ?? null,
        fingerprint: dto.visitorId ?? null,
        ip,
        userAgent,
        location: null,
        lastActiveAt: now,
      });
      visitor = await this.visitorRepo.save(visitor);
    } else {
      let needSave = false;

      visitor.lastActiveAt = now;
      needSave = true;

      if (!visitor.userAgent && userAgent) {
        visitor.userAgent = userAgent;
        needSave = true;
      }

      if (!visitor.visitorId && dto.visitorId) {
        visitor.visitorId = dto.visitorId;
        needSave = true;
      }

      if (!visitor.fingerprint && dto.visitorId) {
        visitor.fingerprint = dto.visitorId;
        needSave = true;
      }

      if (needSave) {
        await this.visitorRepo.save(visitor);
      }
    }

    const log = this.visitorLogRepo.create({
      visitor,
      visitorId: visitor.id,
      ip,
      userAgent,
      pageUrl: dto.url,
      referer: dto.referrer,
    });
    await this.visitorLogRepo.save(log);

    this.onlineStream.trigger();

    return {
      id: visitor.id,
      ip: visitor.ip,
    };
  }

  /**
   * 心跳：仅更新 lastActiveAt，不写入 visitor_logs（供前端定时调用）
   */
  async recordHeartbeat(dto: TrackVisitDto, req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp =
      (typeof forwarded === 'string' ? forwarded : '') ||
      (req.ip ?? '') ||
      (req.socket?.remoteAddress ?? '') ||
      '';
    const ip = rawIp.split(',')[0].trim();
    const userAgent =
      dto.userAgent || (req.headers['user-agent'] as string) || '';

    let visitor = await this.visitorRepo.findOne({
      where: dto.visitorId
        ? [
            { visitorId: dto.visitorId },
            { fingerprint: dto.visitorId },
          ]
        : [{ ip }],
    });
    if (!visitor) {
      visitor = await this.visitorRepo.findOne({ where: { ip } });
    }

    const now = new Date();
    if (!visitor) {
      visitor = this.visitorRepo.create({
        visitorId: dto.visitorId ?? null,
        fingerprint: dto.visitorId ?? null,
        ip,
        userAgent,
        location: null,
        lastActiveAt: now,
      });
      await this.visitorRepo.save(visitor);
      return { success: true };
    }

    visitor.lastActiveAt = now;
    if (!visitor.userAgent && userAgent) {
      visitor.userAgent = userAgent;
    }
    if (!visitor.visitorId && dto.visitorId) {
      visitor.visitorId = dto.visitorId;
    }
    if (!visitor.fingerprint && dto.visitorId) {
      visitor.fingerprint = dto.visitorId;
    }
    await this.visitorRepo.save(visitor);
    this.onlineStream.trigger();
    return { success: true };
  }

  async findAllVisitors() {
    return this.visitorRepo.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async getOnlineStats(minutes = 5) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    const [list, count] = await this.visitorRepo.findAndCount({
      where: { lastActiveAt: MoreThanOrEqual(since) },
      order: { lastActiveAt: 'DESC' },
      select: ['id', 'ip', 'userAgent', 'lastActiveAt', 'visitorId'],
    });
    return {
      count,
      list: list.map((v) => ({
        id: v.id,
        ip: v.ip,
        userAgent: v.userAgent ?? null,
        lastActiveAt: v.lastActiveAt,
        visitorId: v.visitorId ?? null,
      })),
    };
  }

  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 6);

    type RawUv = { uv: string };
    type RawTrend = { date: string; pv: string; uv: string };
    type RawSource = { referer: string | null; count: string };
    type RawCategory = { categoryId: string; name: string; views: string };
    type RawRecentVisitor = { visitorId: number; lastVisitedAt: Date };

    const rawResults = (await Promise.all([
      this.visitorLogRepo.count({
        where: { visitedAt: Between(todayStart, tomorrowStart) },
      }),
      this.visitorLogRepo
        .createQueryBuilder('log')
        .select('COUNT(DISTINCT log.visitorId)', 'uv')
        .where('log.visitedAt >= :start AND log.visitedAt < :end', {
          start: todayStart,
          end: tomorrowStart,
        })
        .getRawOne(),
      this.postRepo.count(),
      this.commentRepo.count(),
      this.visitorLogRepo
        .createQueryBuilder('log')
        .select('DATE(log.visitedAt)', 'date')
        .addSelect('COUNT(*)', 'pv')
        .addSelect('COUNT(DISTINCT log.visitorId)', 'uv')
        .where('log.visitedAt >= :start', { start: sevenDaysAgo })
        .groupBy('DATE(log.visitedAt)')
        .orderBy('date', 'ASC')
        .getRawMany(),
      this.visitorLogRepo
        .createQueryBuilder('log')
        .select('log.referer', 'referer')
        .addSelect('COUNT(*)', 'count')
        .groupBy('log.referer')
        .getRawMany(),
      this.postRepo
        .createQueryBuilder('post')
        .leftJoin('post.category', 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('SUM(post.views)', 'views')
        .groupBy('category.id')
        .addGroupBy('category.name')
        .getRawMany(),
      this.visitorLogRepo
        .createQueryBuilder('log')
        .select('log.visitorId', 'visitorId')
        .addSelect('MAX(log.visitedAt)', 'lastVisitedAt')
        .where('log.visitorId IS NOT NULL')
        .groupBy('log.visitorId')
        .orderBy('lastVisitedAt', 'DESC')
        .limit(20)
        .getRawMany(),
    ])) as [
      number,
      RawUv | undefined,
      number,
      number,
      RawTrend[],
      RawSource[],
      RawCategory[],
      RawRecentVisitor[],
    ];

    const [
      todayPv,
      todayUvRow,
      totalPosts,
      totalComments,
      trendRows,
      sourceRows,
      categoryRows,
      recentVisitorRows,
    ] = rawResults;

    const todayUv = Number(todayUvRow?.uv ?? 0);
    const trend7d = trendRows.map((row) => ({
      date: row.date,
      pv: Number(row.pv),
      uv: Number(row.uv),
    }));

    const sourceRatio = sourceRows.map((row) => ({
      source: this.normalizeSource(row.referer as string | null | undefined),
      value: Number(row.count),
    }));

    const categoryViews = categoryRows.map((row) => ({
      categoryId: Number(row.categoryId),
      name: row.name,
      views: Number(row.views),
    }));

    const recentVisitorRawRows = recentVisitorRows;

    const visitorIds = recentVisitorRawRows.map((row) => row.visitorId);
    const visitors =
      visitorIds.length > 0
        ? await this.visitorRepo.find({
            where: { id: In(visitorIds) },
          })
        : [];

    const visitorMap = new Map<number, Visitor>(visitors.map((v) => [v.id, v]));

    const recentVisitors = recentVisitorRawRows.map((row) => {
      const v = visitorMap.get(row.visitorId) ?? null;
      return {
        id: v?.id ?? row.visitorId,
        visitorId: v?.id ?? row.visitorId,
        ip: v?.ip ?? '',
        pageUrl: null,
        referer: null,
        visitedAt: row.lastVisitedAt,
        location: v?.location ?? null,
        userAgent: v?.userAgent ?? null,
      };
    });

    return {
      today: {
        pv: todayPv,
        uv: todayUv,
      },
      totals: {
        posts: totalPosts,
        comments: totalComments,
      },
      trend7d,
      sourceRatio,
      categoryViews,
      recentVisitors,
    };
  }

  private normalizeSource(referer?: string | null): string {
    if (!referer) return '直接访问';
    const lower = String(referer).toLowerCase();
    if (
      lower.includes('baidu') ||
      lower.includes('google') ||
      lower.includes('bing')
    ) {
      return '搜索引擎';
    }
    if (
      lower.includes('zhihu') ||
      lower.includes('juejin') ||
      lower.includes('github')
    ) {
      return '社区/站外';
    }
    return '其他';
  }
}
