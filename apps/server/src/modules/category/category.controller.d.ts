import { CategoryPageQueryDto, IdParamDto, SaveCategoryDto, UpdateCategoryDto, UpdateCategoryStatusDto } from './category.dto';
import { CategoryService } from './category.service';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    paginate(query: CategoryPageQueryDto): Promise<import("@/common").AdminPaginationResponse<import("./category.entity").Category>>;
    findAll(): Promise<import("./category.entity").Category[]>;
    findOne(params: IdParamDto): Promise<import("./category.entity").Category>;
    save(dto: SaveCategoryDto): Promise<import("./category.entity").Category>;
    update(params: IdParamDto, dto: UpdateCategoryDto): Promise<import("./category.entity").Category>;
    updateStatus(params: IdParamDto, dto: UpdateCategoryStatusDto): Promise<import("./category.entity").Category>;
    remove(params: IdParamDto): Promise<boolean>;
}
