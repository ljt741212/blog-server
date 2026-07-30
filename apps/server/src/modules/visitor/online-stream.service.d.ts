import { Observable } from 'rxjs';
import { VisitorService } from './visitor.service';
export interface OnlineStatsPayload {
    count: number;
    list: Array<{
        id: number;
        ip: string;
        userAgent: string | null;
        lastActiveAt: Date | null;
        visitorId: string | null;
    }>;
}
export declare class OnlineStreamService {
    private readonly visitorService;
    private readonly activity$;
    constructor(visitorService: VisitorService);
    trigger(): void;
    getStream(minutes?: number): Observable<{
        data: OnlineStatsPayload;
    }>;
}
