import { Visitor } from './visitor.entity';
export declare class VisitorLog {
    id: number;
    visitor: Visitor;
    visitorId: number;
    ip: string;
    userAgent: string;
    pageUrl: string;
    referer: string;
    visitedAt: Date;
}
