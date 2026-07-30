import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Post } from "../../../../../src/modules/post/post.entity";
import { User } from "../../../../../src/modules/user/user.entity";
import { Visitor } from "../../../../../src/modules/visitor/visitor.entity";
export declare enum CommentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Comment extends CommonEntity {
    content: string;
    status: CommentStatus;
    likes: number;
    userId: number;
    visitorId: number;
    postId: number;
    parentId: number;
    user: User;
    visitor: Visitor;
    post: Post;
    parent: Comment;
    replies: Comment[];
}
