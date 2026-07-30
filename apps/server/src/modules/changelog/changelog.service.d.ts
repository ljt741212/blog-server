import { Repository } from 'typeorm';
import { ChangelogPageQueryDto, SaveChangelogDto, UpdateChangelogStatusDto } from './changelog.dto';
import { Changelog } from './changelog.entity';
export declare class ChangelogService {
    private readonly changelogRepository;
    constructor(changelogRepository: Repository<Changelog>);
    paginateForAdmin(query: ChangelogPageQueryDto): Promise<import("@/common").AdminPaginationResponse<Changelog>>;
    findAll(): Promise<Changelog[]>;
    findOne(id: number): Promise<Changelog>;
    findPublicOne(id: number): Promise<Changelog>;
    create(dto: SaveChangelogDto): Promise<Changelog>;
    update(id: number, dto: SaveChangelogDto): Promise<Changelog>;
    updateStatus(id: number, dto: UpdateChangelogStatusDto): Promise<Changelog>;
    save(dto: SaveChangelogDto): Promise<Changelog>;
    remove(id: number): Promise<Changelog>;
}
