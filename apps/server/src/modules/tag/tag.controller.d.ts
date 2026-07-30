import { IdParamDto, SaveTagDto, TagPageQueryDto, UpdateTagDto } from './tag.dto';
import { TagService } from './tag.service';
export declare class TagController {
    private readonly tagService;
    constructor(tagService: TagService);
    paginate(query: TagPageQueryDto): Promise<import("@/common").AdminPaginationResponse<import("./tag.entity").Tag>>;
    findAll(): Promise<import("./tag.entity").Tag[]>;
    findOne(params: IdParamDto): Promise<import("./tag.entity").Tag>;
    save(dto: SaveTagDto): Promise<import("./tag.entity").Tag>;
    update(params: IdParamDto, dto: UpdateTagDto): Promise<import("./tag.entity").Tag>;
    remove(params: IdParamDto): Promise<boolean>;
}
