import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Comment } from "../../../../../src/modules/comment/comment.entity";
import { VisitorLog } from './visitor-log.entity';
export declare class Visitor extends CommonEntity {
    visitorId: string | null;
    fingerprint: string | null;
    ip: string;
    location: string | null;
    userAgent: string;
    lastActiveAt: Date | null;
    comments: Comment[];
    logs: VisitorLog[];
}
