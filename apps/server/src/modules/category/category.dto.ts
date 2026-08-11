import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { CategoryStatus } from './category.entity';

export class CategoryPageQueryDto {
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
  @MaxLength(50)
  searchValue?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export class CreateCategoryDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export class SaveCategoryDto extends CreateCategoryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;
}

export class UpdateCategoryStatusDto {
  @Type(() => Number)
  @IsInt()
  @IsEnum(CategoryStatus)
  status: CategoryStatus;
}

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}
