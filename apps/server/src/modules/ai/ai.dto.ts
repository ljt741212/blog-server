import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { PaginationQueryDto } from '@/common';

import { AiProvider } from './ai-config.entity';

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
  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  conversationId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  temporary?: boolean;
}

export class ConfirmDto {
  @IsBoolean()
  confirm: boolean;
}

export class EditorStateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  categoryName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagNames?: string[];

  @IsOptional()
  @IsString()
  coverImage?: string;
}

export class EditorChatDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  conversationId?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => EditorStateDto)
  editorState?: EditorStateDto;
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
