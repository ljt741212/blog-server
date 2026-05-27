import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SaveSiteConfigDto {
  @ApiProperty({ description: '背景图URL', required: false })
  @IsOptional()
  @IsString()
  backgroundImage?: string;
}
