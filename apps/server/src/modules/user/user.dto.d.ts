import { PaginationQueryDto } from "../../../../../src/common";
import { Gender, UserRole } from './user.entity';
export declare class UserLoginDto {
    username: string;
    password: string;
}
export declare class CreateUserDto {
    username: string;
    nickname?: string;
    password: string;
    email: string;
    phone?: string;
    wechat?: string;
    avatar?: string;
    bio?: string;
    github?: string;
    gender?: Gender;
    role?: UserRole;
}
export declare class UpdateUserDto {
    username?: string;
    nickname?: string;
    password?: string;
    email?: string;
    phone?: string;
    wechat?: string;
    avatar?: string;
    bio?: string;
    github?: string;
    gender?: Gender;
    role?: UserRole;
}
export declare class UserListQueryDto extends PaginationQueryDto {
    searchValue?: string;
}
export declare class UserPageQueryDto {
    current?: number;
    pageSize?: number;
    searchValue?: string;
}
export declare class IdParamDto {
    id: number;
}
export declare class SendEmailCodeDto {
    email: string;
}
export declare class EmailLoginDto {
    email: string;
    code: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
