import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { AdminPageQueryDto } from '@/common';

import { AnnouncementStatus } from './announcement.entity';

export class AnnouncementPageQueryDto extends AdminPageQueryDto {
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;
}

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class SaveAnnouncementDto {
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
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isTop?: boolean;
}
