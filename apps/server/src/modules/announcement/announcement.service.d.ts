import { Repository } from 'typeorm';
import { AnnouncementPageQueryDto, SaveAnnouncementDto } from './announcement.dto';
import { Announcement } from './announcement.entity';
export declare class AnnouncementService {
    private readonly repo;
    constructor(repo: Repository<Announcement>);
    paginateForAdmin(query: AnnouncementPageQueryDto): Promise<import("@/common").AdminPaginationResponse<Announcement>>;
    findAll(): Promise<Announcement[]>;
    findOne(id: number): Promise<Announcement>;
    findPublicOne(id: number): Promise<Announcement>;
    create(dto: SaveAnnouncementDto): Promise<Announcement>;
    update(id: number, dto: SaveAnnouncementDto): Promise<Announcement>;
    save(dto: SaveAnnouncementDto): Promise<Announcement>;
    remove(id: number): Promise<boolean>;
}
