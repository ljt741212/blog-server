import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UploadQueryDto {
  @IsOptional()
  @IsString()
  dir?: string;
}

export class SignUrlQueryDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value == null ? undefined : Number(value),
  )
  @IsInt()
  @Min(1)
  @Max(86400)
  expires?: number;
}
