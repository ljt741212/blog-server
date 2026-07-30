import { ChangelogType } from './changelog.entity';
export declare class ChangelogPageQueryDto {
    current?: number;
    pageSize?: number;
    searchValue?: string;
    type?: ChangelogType;
    isPublished?: boolean;
}
export declare class SaveChangelogDto {
    id?: number;
    version: string;
    title: string;
    content: string;
    type?: ChangelogType;
    releaseDate: string;
    isPublished?: boolean;
}
export declare class IdParamDto {
    id: number;
}
export declare class UpdateChangelogStatusDto {
    isPublished: boolean;
}
