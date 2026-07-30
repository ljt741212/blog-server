import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { ChangelogType } from './changelog.entity';

export class ChangelogPageQueryDto {
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
  @MaxLength(200)
  searchValue?: string;

  @IsOptional()
  @IsEnum(ChangelogType)
  type?: ChangelogType;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;
}

export class SaveChangelogDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @IsString()
  @MaxLength(50)
  version: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ChangelogType)
  type?: ChangelogType;

  @Type(() => String)
  @IsDateString()
  releaseDate: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublished?: boolean;
}

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

export class UpdateChangelogStatusDto {
  @Type(() => Boolean)
  @IsBoolean()
  isPublished: boolean;
}
