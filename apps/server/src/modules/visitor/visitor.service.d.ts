import { Repository } from 'typeorm';
import { Category } from "../../../../../src/modules/category/category.entity";
import { Comment } from "../../../../../src/modules/comment/comment.entity";
import { Post } from "../../../../../src/modules/post/post.entity";
import { TrackVisitDto } from './dto/track-visit.dto';
import { VisitorPageQueryDto } from './dto/visitor-page-query.dto';
import { OnlineStreamService } from './online-stream.service';
import { VisitorLog } from './visitor-log.entity';
import { Visitor } from './visitor.entity';
import type { Request } from 'express';
export declare class VisitorService {
    private readonly visitorRepo;
    private readonly visitorLogRepo;
    private readonly postRepo;
    private readonly commentRepo;
    private readonly categoryRepo;
    private readonly onlineStream;
    constructor(visitorRepo: Repository<Visitor>, visitorLogRepo: Repository<VisitorLog>, postRepo: Repository<Post>, commentRepo: Repository<Comment>, categoryRepo: Repository<Category>, onlineStream: OnlineStreamService);
    recordVisit(dto: TrackVisitDto, req: Request): Promise<{
        id: number;
        ip: string;
    }>;
    recordHeartbeat(dto: TrackVisitDto, req: Request): Promise<{
        success: boolean;
    }>;
    paginateForAdmin(query: VisitorPageQueryDto): Promise<import("@/common").AdminPaginationResponse<Visitor>>;
    getOnlineStats(minutes?: number): Promise<{
        count: number;
        list: {
            id: number;
            ip: string;
            location: string | null;
            userAgent: string;
            lastActiveAt: Date | null;
            visitorId: string | null;
        }[];
    }>;
    getDashboardStats(): Promise<{
        today: {
            pv: number;
            uv: number;
        };
        totals: {
            posts: number;
            comments: number;
        };
        trend7d: {
            date: string;
            pv: number;
            uv: number;
        }[];
        sourceRatio: {
            source: string;
            value: number;
        }[];
        categoryViews: {
            categoryId: number;
            name: string;
            views: number;
        }[];
    }>;
    private extractClientIp;
    private normalizeSource;
}
