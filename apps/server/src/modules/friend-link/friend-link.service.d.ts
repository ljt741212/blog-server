import { Repository } from 'typeorm';
import { ApplyFriendLinkDto, BatchSortDto, SaveFriendLinkDto, UpdateFriendLinkStatusDto } from './friend-link.dto';
import { FriendLink, FriendLinkStatus } from './friend-link.entity';
export declare class FriendLinkService {
    private readonly friendLinkRepository;
    constructor(friendLinkRepository: Repository<FriendLink>);
    findAll(status?: FriendLinkStatus, sortOrder?: 'ASC' | 'DESC'): Promise<FriendLink[]>;
    findOne(id: number): Promise<FriendLink>;
    save(dto: SaveFriendLinkDto): Promise<FriendLink>;
    create(dto: SaveFriendLinkDto): Promise<FriendLink>;
    update(id: number, dto: SaveFriendLinkDto): Promise<FriendLink>;
    updateStatus(id: number, dto: UpdateFriendLinkStatusDto): Promise<FriendLink>;
    apply(dto: ApplyFriendLinkDto): Promise<void>;
    batchSort(dto: BatchSortDto): Promise<void>;
    remove(id: number): Promise<boolean>;
}
