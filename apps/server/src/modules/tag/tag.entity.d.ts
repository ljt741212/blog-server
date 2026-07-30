import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Post } from "../../../../../src/modules/post/post.entity";
export declare enum TagStatus {
    DISABLED = 0,
    ENABLED = 1
}
export declare class Tag extends CommonEntity {
    name: string;
    description?: string;
    version: number;
    status: TagStatus;
    posts: Post[];
}
