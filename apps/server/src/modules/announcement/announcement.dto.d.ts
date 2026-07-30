import { AdminPageQueryDto } from "../../../../../src/common";
import { AnnouncementStatus } from './announcement.entity';
export declare class AnnouncementPageQueryDto extends AdminPageQueryDto {
    status?: AnnouncementStatus;
}
export declare class IdParamDto {
    id: number;
}
export declare class SaveAnnouncementDto {
    id?: number;
    title: string;
    content: string;
    status?: AnnouncementStatus;
    isTop?: boolean;
}
