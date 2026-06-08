import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { AiProvider } from './ai-config.entity';
import { AiAction } from './ai-usage.entity';

export class SaveAiConfigDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(AiProvider)
  provider: AiProvider;

  @IsString()
  @MinLength(1)
  model: string;

  @ValidateIf((o: SaveAiConfigDto) => o.apiKey !== '' && o.apiKey !== undefined)
  @IsString()
  @MinLength(1)
  apiKey?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(131072)
  maxTokens?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}

export class ChatDto {
  @IsArray()
  messages: { role: string; content: string }[];

  @IsOptional()
  @IsEnum(AiAction)
  action?: AiAction;
}

export class UsageQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  model?: string;
}
