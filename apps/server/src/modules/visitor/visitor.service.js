"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("../../../../../src/common");
const ip_location_1 = require("../../../../../src/common/ip-location");
const ua_parser_1 = require("../../../../../src/common/ua-parser");
const category_entity_1 = require("../../../../../src/modules/category/category.entity");
const comment_entity_1 = require("../../../../../src/modules/comment/comment.entity");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
const online_stream_service_1 = require("./online-stream.service");
const visitor_log_entity_1 = require("./visitor-log.entity");
const visitor_entity_1 = require("./visitor.entity");
let VisitorService = class VisitorService {
    visitorRepo;
    visitorLogRepo;
    postRepo;
    commentRepo;
    categoryRepo;
    onlineStream;
    constructor(visitorRepo, visitorLogRepo, postRepo, commentRepo, categoryRepo, onlineStream) {
        this.visitorRepo = visitorRepo;
        this.visitorLogRepo = visitorLogRepo;
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
        this.categoryRepo = categoryRepo;
        this.onlineStream = onlineStream;
    }
    async recordVisit(dto, req) {
        const ip = this.extractClientIp(req);
        const userAgent = (0, ua_parser_1.parseUserAgent)(dto.userAgent || req.headers['user-agent'] || '');
        let visitor = null;
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
                location: (0, ip_location_1.ipToLocation)(ip),
                lastActiveAt: now,
            });
            visitor = await this.visitorRepo.save(visitor);
        }
        else {
            let needSave = false;
            visitor.lastActiveAt = now;
            needSave = true;
            if (!visitor.location) {
                visitor.location = (0, ip_location_1.ipToLocation)(ip);
                needSave = true;
            }
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
    async recordHeartbeat(dto, req) {
        const ip = this.extractClientIp(req);
        const userAgent = (0, ua_parser_1.parseUserAgent)(dto.userAgent || req.headers['user-agent'] || '');
        let visitor = await this.visitorRepo.findOne({
            where: dto.visitorId
                ? [{ visitorId: dto.visitorId }, { fingerprint: dto.visitorId }]
                : [{ ip }],
        });
        const now = new Date();
        if (!visitor) {
            visitor = this.visitorRepo.create({
                visitorId: dto.visitorId ?? null,
                fingerprint: dto.visitorId ?? null,
                ip,
                userAgent,
                location: (0, ip_location_1.ipToLocation)(ip),
                lastActiveAt: now,
            });
            await this.visitorRepo.save(visitor);
            return { success: true };
        }
        visitor.lastActiveAt = now;
        if (!visitor.location) {
            visitor.location = (0, ip_location_1.ipToLocation)(ip);
        }
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
    async paginateForAdmin(query) {
        const { ip, location, startTime, endTime } = query;
        const qb = this.visitorRepo.createQueryBuilder('visitor');
        const filters = [
            [ip, 'visitor.ip LIKE :ip', { ip: `%${ip}%` }],
            [location, 'visitor.location LIKE :loc', { loc: `%${location}%` }],
            [startTime, 'visitor.lastActiveAt >= :start', { start: startTime }],
            [endTime, 'visitor.lastActiveAt <= :end', { end: endTime }],
        ];
        for (const [value, sql, params] of filters) {
            if (value)
                qb.andWhere(sql, params);
        }
        qb.orderBy('visitor.lastActiveAt', 'DESC');
        return (0, common_2.paginateQueryBuilderForAdmin)(qb, query);
    }
    async getOnlineStats(minutes = 5) {
        const since = new Date(Date.now() - minutes * 60 * 1000);
        const [list, count] = await this.visitorRepo.findAndCount({
            where: { lastActiveAt: (0, typeorm_2.MoreThanOrEqual)(since) },
            order: { lastActiveAt: 'DESC' },
            select: [
                'id',
                'ip',
                'location',
                'userAgent',
                'lastActiveAt',
                'visitorId',
            ],
        });
        return {
            count,
            list: list.map((v) => ({
                id: v.id,
                ip: v.ip,
                location: v.location ?? null,
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
        const rawResults = (await Promise.all([
            this.visitorLogRepo.count({
                where: { visitedAt: (0, typeorm_2.Between)(todayStart, tomorrowStart) },
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
        ]));
        const [todayPv, todayUvRow, totalPosts, totalComments, trendRows, sourceRows, categoryRows,] = rawResults;
        const todayUv = Number(todayUvRow?.uv ?? 0);
        const trend7d = trendRows.map((row) => ({
            date: row.date,
            pv: Number(row.pv),
            uv: Number(row.uv),
        }));
        const sourceRatio = sourceRows.map((row) => ({
            source: this.normalizeSource(row.referer),
            value: Number(row.count),
        }));
        const categoryViews = categoryRows.map((row) => ({
            categoryId: Number(row.categoryId),
            name: row.name,
            views: Number(row.views),
        }));
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
        };
    }
    extractClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const rawIp = (typeof forwarded === 'string' ? forwarded : '') ||
            (req.ip ?? '') ||
            (req.socket?.remoteAddress ?? '') ||
            '';
        return rawIp.split(',')[0].trim();
    }
    normalizeSource(referer) {
        if (!referer)
            return '直接访问';
        const lower = String(referer).toLowerCase();
        if (lower.includes('baidu') ||
            lower.includes('google') ||
            lower.includes('bing')) {
            return '搜索引擎';
        }
        if (lower.includes('zhihu') ||
            lower.includes('juejin') ||
            lower.includes('github')) {
            return '社区/站外';
        }
        return '其他';
    }
};
exports.VisitorService = VisitorService;
exports.VisitorService = VisitorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(visitor_entity_1.Visitor)),
    __param(1, (0, typeorm_1.InjectRepository)(visitor_log_entity_1.VisitorLog)),
    __param(2, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(3, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(4, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => online_stream_service_1.OnlineStreamService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        online_stream_service_1.OnlineStreamService])
], VisitorService);
//# sourceMappingURL=visitor.service.js.map