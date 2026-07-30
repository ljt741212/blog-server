import { PostStatus } from './post.entity';
export declare class PostPageQueryDto {
    current?: number;
    pageSize?: number;
    searchValue?: string;
    status?: PostStatus;
    categoryId?: number;
    tagId?: number;
}
export declare class SavePostDto {
    id?: number;
    title: string;
    content: string;
    summary?: string;
    coverImage?: string;
    categoryId: number;
    tagIds?: number[];
    status?: PostStatus;
    publishTime?: Date;
}
export declare class UpdatePostStatusDto {
    status: PostStatus;
}
export declare class IdParamDto {
    id: number;
}
export declare class UpdatePostTopDto {
    isTop: boolean;
}
