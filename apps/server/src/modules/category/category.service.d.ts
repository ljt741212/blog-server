import { Repository } from 'typeorm';
import { CategoryPageQueryDto, CreateCategoryDto, SaveCategoryDto, UpdateCategoryDto } from './category.dto';
import { Category, CategoryStatus } from './category.entity';
export declare class CategoryService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    paginateForAdmin(query: CategoryPageQueryDto): Promise<import("@/common").AdminPaginationResponse<Category>>;
    findAll(): Promise<Category[]>;
    findOne(id: number): Promise<Category>;
    create(dto: CreateCategoryDto): Promise<Category>;
    update(id: number, dto: UpdateCategoryDto): Promise<Category>;
    updateStatus(id: number, status: CategoryStatus): Promise<Category>;
    save(dto: SaveCategoryDto): Promise<Category>;
    remove(id: number): Promise<boolean>;
}
