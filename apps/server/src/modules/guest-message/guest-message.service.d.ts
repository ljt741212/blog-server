import { Repository } from 'typeorm';
import { Visitor } from "../../../../../src/modules/visitor/visitor.entity";
import { CreateGuestMessageDto, GuestMessageAdminPageQueryDto, GuestMessageListQueryDto } from './guest-message.dto';
import { GuestMessage, GuestMessageStatus } from './guest-message.entity';
export declare class GuestMessageService {
    private readonly guestMessageRepository;
    private readonly visitorRepository;
    constructor(guestMessageRepository: Repository<GuestMessage>, visitorRepository: Repository<Visitor>);
    create(dto: CreateGuestMessageDto): Promise<GuestMessage>;
    updateStatus(id: number, status: GuestMessageStatus): Promise<boolean>;
    paginateForAdmin(query: GuestMessageAdminPageQueryDto): Promise<{
        items: {
            id: number;
            content: string;
            status: GuestMessageStatus;
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
    remove(id: number): Promise<boolean>;
    private buildGuestMessageItem;
    private buildGuestMessageForPublic;
}
