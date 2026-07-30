import { CommonEntity } from "../../../../../src/common/entity/common.entity";
export declare enum FriendLinkStatus {
    DISABLED = 0,
    ENABLED = 1
}
export declare class FriendLink extends CommonEntity {
    name: string;
    url: string;
    description: string;
    avatar: string;
    sort: number;
    status: FriendLinkStatus;
}
