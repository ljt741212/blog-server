import { CreateGuestMessageDto, GuestMessageAdminPageQueryDto, GuestMessageIdParamDto, GuestMessageListQueryDto, UpdateGuestMessageStatusDto } from './guest-message.dto';
import { GuestMessageService } from './guest-message.service';
export declare class GuestMessageController {
    private readonly guestMessageService;
    constructor(guestMessageService: GuestMessageService);
    create(dto: CreateGuestMessageDto): Promise<import("./guest-message.entity").GuestMessage>;
    updateStatus(params: GuestMessageIdParamDto, dto: UpdateGuestMessageStatusDto): Promise<boolean>;
    paginate(query: GuestMessageAdminPageQueryDto): Promise<{
        items: {
            id: number;
            content: string;
            status: import("./guest-message.entity").GuestMessageStatus;
            nickname: string | null;
            email: string | null;
            user: {
                id: number;
                username: string;
            } | null;
            visitor: {
                id: number;
                ip: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: import("@/common").AdminPaginationMeta;
    }>;
    findList(query: GuestMessageListQueryDto): Promise<{
        id: number;
        content: string;
        nickname: string | null;
        user: {
            id: number;
            username: string;
            avatar: string;
        } | null;
        visitor: {
            id: number;
            ip: string;
        } | null;
        createdAt: Date;
    }[]>;
    remove(params: GuestMessageIdParamDto): Promise<boolean>;
}
