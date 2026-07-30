import { IdParamDto, PostPageQueryDto, SavePostDto, UpdatePostStatusDto, UpdatePostTopDto } from './post.dto';
import { PostService } from './post.service';
export declare class PostController {
    private readonly postService;
    constructor(postService: PostService);
    paginate(query: PostPageQueryDto): Promise<{
        items: {
            id: string;
            title: string;
            summary: string;
            coverImage: string;
            status: import("./post.entity").PostStatus;
            isTop: boolean;
            categoryId: number;
            category: string;
            tagIds: number[];
            tags: string;
            author: string;
            publishTime: Date | null;
            views: number;
            likes: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            current: number;
            pageSize: number;
        };
    }>;
    findAll(query: PostPageQueryDto): Promise<{
        items: {
            id: string;
            title: string;
            content: string;
            summary: string;
            coverImage: string;
            publishTime: Date | null;
            views: number;
            likes: number;
            category: {
                id: number;
                name: string;
                description: string;
            } | null;
            tags: {
                id: number;
                name: string;
                description: string | undefined;
            }[];
            author: {
                id: number;
                username: string;
                nickname: string;
                avatar: string;
                bio: string;
            } | null;
            status: import("./post.entity").PostStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            current: number;
            pageSize: number;
        };
    }>;
    findOne(params: IdParamDto, authorization?: string): Promise<{
        id: string;
        title: string;
        content: string;
        summary: string;
        coverImage: string;
        publishTime: Date | null;
        views: number;
        likes: number;
        category: {
            id: number;
            name: string;
            description: string;
        } | null;
        tags: {
            id: number;
            name: string;
            description: string | undefined;
        }[];
        author: {
            id: number;
            username: string;
            nickname: string;
            avatar: string;
            bio: string;
        } | null;
        status: import("./post.entity").PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    save(dto: SavePostDto, authorization?: string): Promise<{
        id: string;
        title: string;
        content: string;
        summary: string;
        coverImage: string;
        publishTime: Date | null;
        views: number;
        likes: number;
        category: {
            id: number;
            name: string;
            description: string;
        } | null;
        tags: {
            id: number;
            name: string;
            description: string | undefined;
        }[];
        author: {
            id: number;
            username: string;
            nickname: string;
            avatar: string;
            bio: string;
        } | null;
        status: import("./post.entity").PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(params: IdParamDto, dto: UpdatePostStatusDto): Promise<boolean>;
    incrementViews(params: IdParamDto): Promise<boolean>;
    incrementLikes(params: IdParamDto): Promise<boolean>;
    updateTop(params: IdParamDto, dto: UpdatePostTopDto): Promise<boolean>;
    remove(params: IdParamDto): Promise<boolean>;
}
