import { ApplyFriendLinkDto, BatchSortDto, FindAllQueryDto, IdParamDto, SaveFriendLinkDto, UpdateFriendLinkStatusDto } from './friend-link.dto';
import { FriendLinkService } from './friend-link.service';
export declare class FriendLinkController {
    private readonly friendLinkService;
    constructor(friendLinkService: FriendLinkService);
    findAll(query: FindAllQueryDto): Promise<import("./friend-link.entity").FriendLink[]>;
    apply(dto: ApplyFriendLinkDto): Promise<void>;
    save(dto: SaveFriendLinkDto): Promise<import("./friend-link.entity").FriendLink>;
    update(params: IdParamDto, dto: SaveFriendLinkDto): Promise<import("./friend-link.entity").FriendLink>;
    batchSort(dto: BatchSortDto): Promise<void>;
    updateStatus(params: IdParamDto, dto: UpdateFriendLinkStatusDto): Promise<import("./friend-link.entity").FriendLink>;
    remove(params: IdParamDto): Promise<boolean>;
}
