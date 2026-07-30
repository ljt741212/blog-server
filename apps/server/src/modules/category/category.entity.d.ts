import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Post } from "../../../../../src/modules/post/post.entity";
export declare enum CategoryStatus {
    DISABLED = 0,
    ENABLED = 1
}
export declare class Category extends CommonEntity {
    name: string;
    description: string;
    status: CategoryStatus;
    version: number;
    posts: Post[];
}
