import { TagStatus } from './tag.entity';
export declare class TagPageQueryDto {
    current?: number;
    pageSize?: number;
    searchValue?: string;
    status?: TagStatus;
}
export declare class CreateTagDto {
    name: string;
    description?: string;
    status?: TagStatus;
}
export declare class SaveTagDto extends CreateTagDto {
    id?: number;
}
export declare class UpdateTagDto {
    name?: string;
    description?: string;
    status?: TagStatus;
}
export declare class IdParamDto {
    id: number;
}
