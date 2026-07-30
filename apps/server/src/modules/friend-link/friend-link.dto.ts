import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { FriendLinkStatus } from './friend-link.entity';

export class FindAllQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(FriendLinkStatus)
  status?: FriendLinkStatus;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class SaveFriendLinkDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sort?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(FriendLinkStatus)
  status?: FriendLinkStatus;
}

export class ApplyFriendLinkDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}

export class SortItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @Type(() => Number)
  @IsInt()
  sort: number;
}

export class BatchSortDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortItemDto)
  items: SortItemDto[];
}

export class UpdateFriendLinkStatusDto {
  @Type(() => Number)
  @IsInt()
  @IsEnum(FriendLinkStatus)
  status: FriendLinkStatus;
}
