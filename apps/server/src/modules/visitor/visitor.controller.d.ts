import { TrackVisitDto } from './dto/track-visit.dto';
import { VisitorPageQueryDto } from './dto/visitor-page-query.dto';
import { OnlineStreamService } from './online-stream.service';
import { VisitorService } from './visitor.service';
import type { Request } from 'express';
export declare class VisitorController {
    private readonly visitorService;
    private readonly onlineStreamService;
    constructor(visitorService: VisitorService, onlineStreamService: OnlineStreamService);
    recordVisit(body: Partial<TrackVisitDto>, req: Request): Promise<{
        success: boolean;
    }>;
    heartbeat(body: Partial<TrackVisitDto>, req: Request): Promise<{
        success: boolean;
    }>;
    paginate(query: VisitorPageQueryDto): Promise<import("@/common").AdminPaginationResponse<import("./visitor.entity").Visitor>>;
    streamOnline(minutesStr?: string): import("rxjs").Observable<{
        data: import("./online-stream.service").OnlineStatsPayload;
    }>;
    getDashboard(): Promise<{
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
}
