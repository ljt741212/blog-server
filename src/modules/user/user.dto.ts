import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { Gender, UserRole } from './user.entity';

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;
}

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  Name?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  NikName?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @IsString()
  wechat?: string;

  @IsOptional()
  @IsString()
  WeChat?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  Avatar?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsString()
  githubAccount?: string;

  @IsOptional()
  @IsString()
  GitHub?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/** 修改用户入参：与前端约定使用大驼峰 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  Name?: string;

  @IsOptional()
  @IsString()
  NikName?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  Password?: string;

  @IsOptional()
  @IsEmail()
  Email?: string;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @IsString()
  WeChat?: string;

  @IsOptional()
  @IsString()
  Avatar?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsString()
  GitHub?: string;

  @IsOptional()
  @IsEnum(Gender)
  Gender?: Gender;

  @IsOptional()
  @IsEnum(UserRole)
  Role?: UserRole;
}

export class UserListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  searchValue?: string;
}

export class UserPageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  current?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  searchValue?: string;
}

export class IdParamDto {
  @IsNotEmpty()
  id: number;
}

export class ChangePasswordDto {
  @IsNotEmpty({ message: '请输入原密码' })
  @IsString()
  oldPassword: string;

  @IsNotEmpty({ message: '请输入新密码' })
  @IsString()
  @MinLength(4, { message: '新密码至少 4 位' })
  newPassword: string;
}
