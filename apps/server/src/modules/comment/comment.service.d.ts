import { Repository } from 'typeorm';
import { Post } from "../../../../../src/modules/post/post.entity";
import { Visitor } from "../../../../../src/modules/visitor/visitor.entity";
import { CommentAdminPageQueryDto, CommentsByPostQueryDto, CreateCommentDto } from './comment.dto';
import { Comment, CommentStatus } from './comment.entity';
export declare class CommentService {
    private readonly commentRepository;
    private readonly postRepository;
    private readonly visitorRepository;
    constructor(commentRepository: Repository<Comment>, postRepository: Repository<Post>, visitorRepository: Repository<Visitor>);
    create(dto: CreateCommentDto): Promise<Comment>;
    updateStatus(id: number, status: CommentStatus): Promise<boolean>;
    paginateForAdmin(query: CommentAdminPageQueryDto): Promise<{
        items: {
            id: number;
            content: string;
            status: CommentStatus;
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
            status: CommentStatus;
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
    remove(id: number): Promise<boolean>;
    private ensurePostExists;
    private ensureCommentExists;
    private buildCommentItem;
    private buildCommentForPost;
}
