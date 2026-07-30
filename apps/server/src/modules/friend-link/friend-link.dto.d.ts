import { FriendLinkStatus } from './friend-link.entity';
export declare class FindAllQueryDto {
    status?: FriendLinkStatus;
    sortOrder?: 'ASC' | 'DESC';
}
export declare class IdParamDto {
    id: number;
}
export declare class SaveFriendLinkDto {
    id?: number;
    name: string;
    url: string;
    description?: string;
    avatar?: string;
    sort?: number;
    status?: FriendLinkStatus;
}
export declare class ApplyFriendLinkDto {
    name: string;
    url: string;
    description?: string;
    avatar?: string;
}
export declare class SortItemDto {
    id: number;
    sort: number;
}
export declare class BatchSortDto {
    items: SortItemDto[];
}
export declare class UpdateFriendLinkStatusDto {
    status: FriendLinkStatus;
}
