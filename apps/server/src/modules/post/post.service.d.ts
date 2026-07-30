import { Repository } from 'typeorm';
import { Category } from "../../../../../src/modules/category/category.entity";
import { Comment } from "../../../../../src/modules/comment/comment.entity";
import { Tag } from "../../../../../src/modules/tag/tag.entity";
import { AuthUtil } from "../../../../../src/shared/auth/auth.util";
import { PostPageQueryDto, SavePostDto } from './post.dto';
import { Post, PostStatus } from './post.entity';
export declare class PostService {
    private readonly postRepository;
    private readonly categoryRepository;
    private readonly tagRepository;
    private readonly commentRepository;
    private readonly authUtil;
    constructor(postRepository: Repository<Post>, categoryRepository: Repository<Category>, tagRepository: Repository<Tag>, commentRepository: Repository<Comment>, authUtil: AuthUtil);
    paginateForAdmin(query: PostPageQueryDto): Promise<{
        items: {
            id: string;
            title: string;
            summary: string;
            coverImage: string;
            status: PostStatus;
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
    findAll(query?: PostPageQueryDto): Promise<{
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
            status: PostStatus;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: {
            total: number;
            current: number;
            pageSize: number;
        };
    }>;
    findOne(id: number): Promise<Post>;
    findDetail(id: number): Promise<{
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
        status: PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findPublicDetail(id: number, authorization?: string): Promise<{
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
        status: PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: SavePostDto, authorization?: string): Promise<{
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
        status: PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: SavePostDto): Promise<{
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
        status: PostStatus;
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
        status: PostStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<boolean>;
    updateStatus(id: number, status: PostStatus): Promise<boolean>;
    incrementViews(id: number): Promise<boolean>;
    incrementLikes(id: number): Promise<boolean>;
    updateTop(id: number, isTop: boolean): Promise<boolean>;
    private ensureCategoryExists;
    private buildPublicPost;
    private buildAdminPost;
}
