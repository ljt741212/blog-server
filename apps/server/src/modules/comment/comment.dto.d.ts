import { PaginationQueryDto } from "../../../../../src/common";
import { CommentStatus } from './comment.entity';
export declare class CommentAdminPageQueryDto {
    current?: number;
    pageSize?: number;
    postId?: number;
    status?: CommentStatus;
    searchValue?: string;
}
export declare class CreateCommentDto {
    content: string;
    postId: number;
    parentId?: number;
    userId?: number;
    visitorId?: string;
}
export declare class UpdateCommentStatusDto {
    status: CommentStatus;
}
export declare class CommentIdParamDto {
    id: number;
}
export declare class CommentsByPostQueryDto extends PaginationQueryDto {
    postId: number;
    approvedOnly?: boolean;
}
