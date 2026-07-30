import { CommonEntity } from "../../../../../src/common/entity/common.entity";
import { Comment } from "../../../../../src/modules/comment/comment.entity";
import { Post } from "../../../../../src/modules/post/post.entity";
export declare enum UserRole {
    ADMIN = 0,
    SUPER_ADMIN = 1
}
export declare enum Gender {
    FEMALE = 0,
    MALE = 1
}
export declare class User extends CommonEntity {
    username: string;
    nickname: string;
    password: string;
    email: string;
    phone: string;
    wechat: string;
    role: UserRole;
    avatar: string;
    bio: string;
    githubAccount: string;
    gender: Gender;
    posts: Post[];
    comments: Comment[];
}
