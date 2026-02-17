import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsBoolean,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { PostStatus } from './post.entity';

export class PostListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  keyword?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

export class PostPageQueryDto {
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
  @MaxLength(100)
  searchValue?: string;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
}

export class SavePostDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  coverImage?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  tagIds?: number[];

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @Type(() => Date)
  publishTime?: Date;
}

export class UpdatePostStatusDto {
  @Type(() => String)
  @IsEnum(PostStatus)
  status: PostStatus;
}

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class UpdatePostTopDto {
  @Type(() => Boolean)
  @IsBoolean()
  isTop: boolean;
}
