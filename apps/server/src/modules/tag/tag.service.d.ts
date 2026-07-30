import { Repository } from 'typeorm';
import { CreateTagDto, SaveTagDto, TagPageQueryDto, UpdateTagDto } from './tag.dto';
import { Tag } from './tag.entity';
export declare class TagService {
    private readonly tagRepository;
    constructor(tagRepository: Repository<Tag>);
    paginateForAdmin(query: TagPageQueryDto): Promise<import("@/common").AdminPaginationResponse<Tag>>;
    findAll(): Promise<Tag[]>;
    findOne(id: number): Promise<Tag>;
    create(dto: CreateTagDto): Promise<Tag>;
    update(id: number, dto: UpdateTagDto): Promise<Tag>;
    save(dto: SaveTagDto): Promise<Tag>;
    remove(id: number): Promise<boolean>;
}
