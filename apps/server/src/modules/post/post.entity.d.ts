import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Category } from "../../../../../src/modules/category/category.entity";
import { Comment } from "../../../../../src/modules/comment/comment.entity";
import { Tag } from "../../../../../src/modules/tag/tag.entity";
import { User } from "../../../../../src/modules/user/user.entity";
export declare enum PostStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare class Post extends CommonEntity {
    title: string;
    content: string;
    summary: string;
    coverImage: string;
    isTop: boolean;
    isRecommended: boolean;
    slug: string;
    views: number;
    likes: number;
    status: PostStatus;
    publishTime: Date | null;
    user: User;
    category: Category;
    tags: Tag[];
    comments: Comment[];
}
