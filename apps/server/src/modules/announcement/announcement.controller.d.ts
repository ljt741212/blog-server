import { AnnouncementPageQueryDto, IdParamDto, SaveAnnouncementDto } from './announcement.dto';
import { AnnouncementService } from './announcement.service';
export declare class AnnouncementController {
    private readonly announcementService;
    constructor(announcementService: AnnouncementService);
    paginate(query: AnnouncementPageQueryDto): Promise<import("@/common").AdminPaginationResponse<import("./announcement.entity").Announcement>>;
    findAll(): Promise<import("./announcement.entity").Announcement[]>;
    findOne(params: IdParamDto): Promise<import("./announcement.entity").Announcement>;
    save(dto: SaveAnnouncementDto): Promise<import("./announcement.entity").Announcement>;
    remove(params: IdParamDto): Promise<boolean>;
}
