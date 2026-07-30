import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { User } from "../../../../../src/modules/user/user.entity";
import { Visitor } from "../../../../../src/modules/visitor/visitor.entity";
export declare enum GuestMessageStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class GuestMessage extends CommonEntity {
    content: string;
    status: GuestMessageStatus;
    nickname: string | null;
    email: string | null;
    userId: number | null;
    visitorId: number | null;
    user: User | null;
    visitor: Visitor | null;
}
