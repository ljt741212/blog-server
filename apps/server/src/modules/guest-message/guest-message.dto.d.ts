import { PaginationQueryDto } from "../../../../../src/common";
import { GuestMessageStatus } from './guest-message.entity';
export declare class GuestMessageAdminPageQueryDto {
    current?: number;
    pageSize?: number;
    status?: GuestMessageStatus;
    searchValue?: string;
}
export declare class CreateGuestMessageDto {
    content: string;
    nickname?: string;
    email?: string;
    userId?: number;
    visitorId?: number;
    visitorUuid?: string;
}
export declare class UpdateGuestMessageStatusDto {
    status: GuestMessageStatus;
}
export declare class GuestMessageIdParamDto {
    id: number;
}
export declare class GuestMessageListQueryDto extends PaginationQueryDto {
    approvedOnly?: boolean;
}
