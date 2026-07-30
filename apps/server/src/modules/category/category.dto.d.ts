import { CategoryStatus } from './category.entity';
export declare class CategoryPageQueryDto {
    current?: number;
    pageSize?: number;
    searchValue?: string;
    status?: CategoryStatus;
}
export declare class CreateCategoryDto {
    name: string;
    description?: string;
    status?: CategoryStatus;
}
export declare class SaveCategoryDto extends CreateCategoryDto {
    id?: number;
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
    status?: CategoryStatus;
}
export declare class UpdateCategoryStatusDto {
    status: CategoryStatus;
}
export declare class IdParamDto {
    id: number;
}
