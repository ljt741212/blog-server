import { ChangelogPageQueryDto, IdParamDto, SaveChangelogDto, UpdateChangelogStatusDto } from './changelog.dto';
import { ChangelogService } from './changelog.service';
export declare class ChangelogController {
    private readonly changelogService;
    constructor(changelogService: ChangelogService);
    paginate(query: ChangelogPageQueryDto): Promise<import("@/common").AdminPaginationResponse<import("./changelog.entity").Changelog>>;
    findAll(): Promise<import("./changelog.entity").Changelog[]>;
    findOne(params: IdParamDto): Promise<import("./changelog.entity").Changelog>;
    save(dto: SaveChangelogDto): Promise<import("./changelog.entity").Changelog>;
    updateStatus(params: IdParamDto, dto: UpdateChangelogStatusDto): Promise<import("./changelog.entity").Changelog>;
    remove(params: IdParamDto): Promise<import("./changelog.entity").Changelog>;
}
