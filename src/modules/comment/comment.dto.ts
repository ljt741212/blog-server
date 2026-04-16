import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { CommentStatus } from './comment.entity';

export class CommentPageQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId?: number;

  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;
}

export class CommentAdminPageQueryDto {
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId?: number;

  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchValue?: string;
}

export class CreateCommentDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  visitorId?: string;
}

export class UpdateCommentStatusDto {
  @IsEnum(CommentStatus)
  status: CommentStatus;
}

export class CommentIdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class CommentsByPostQueryDto extends PaginationQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  postId: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  approvedOnly?: boolean;
}
