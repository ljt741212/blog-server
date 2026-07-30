import { CommonEntity } from "../../../../../src/common/entity/common.entity";
export declare enum AnnouncementStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare class Announcement extends CommonEntity {
    title: string;
    content: string;
    status: AnnouncementStatus;
    isTop: boolean;
    views: number;
}
