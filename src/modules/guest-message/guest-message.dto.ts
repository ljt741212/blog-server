import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { GuestMessageStatus } from './guest-message.entity';

export class GuestMessageAdminPageQueryDto {
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
  @IsEnum(GuestMessageStatus)
  status?: GuestMessageStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  searchValue?: string;
}

export class CreateGuestMessageDto {
  @IsString()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  visitorId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  visitorUuid?: string;
}

export class UpdateGuestMessageStatusDto {
  @IsEnum(GuestMessageStatus)
  status: GuestMessageStatus;
}

export class GuestMessageIdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class GuestMessageListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  approvedOnly?: boolean;
}
