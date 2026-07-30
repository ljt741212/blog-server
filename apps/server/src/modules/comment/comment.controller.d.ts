import { CommentAdminPageQueryDto, CommentIdParamDto, CommentsByPostQueryDto, CreateCommentDto, UpdateCommentStatusDto } from './comment.dto';
import { CommentService } from './comment.service';
export declare class CommentController {
    private readonly commentService;
    constructor(commentService: CommentService);
    create(dto: CreateCommentDto): Promise<import("./comment.entity").Comment>;
    updateStatus(params: CommentIdParamDto, dto: UpdateCommentStatusDto): Promise<boolean>;
    paginate(query: CommentAdminPageQueryDto): Promise<{
        items: {
            id: number;
            content: string;
            status: import("./comment.entity").CommentStatus;
            likes: number;
            postId: number;
            parentId: number;
            user: {
                id: number;
                username: string;
            } | null;
            visitor: {
                id: number;
                ip: string;
            } | null;
            post: {
                id: number;
                title: string;
            } | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        meta: import("@/common").AdminPaginationMeta;
    }>;
    findByPostId(query: CommentsByPostQueryDto): Promise<{
        items: {
            id: number;
            content: string;
            likes: number;
            status: import("./comment.entity").CommentStatus;
            user: {
                id: number;
                username: string;
                avatar: string;
            } | null;
            visitor: {
                id: number;
                ip: string;
                userAgent: string;
            } | null;
            replies: {
                id: number;
                content: string;
                likes: number;
                user: {
                    id: number;
                    username: string;
                    avatar: string;
                } | null;
                visitor: {
                    id: number;
                    ip: string;
                } | null;
                createdAt: Date;
            }[];
            createdAt: Date;
        }[];
        meta: import("@/common").AdminPaginationMeta;
    }>;
    remove(params: CommentIdParamDto): Promise<boolean>;
}
