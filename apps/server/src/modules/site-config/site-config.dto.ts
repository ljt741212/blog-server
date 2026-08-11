import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SaveSiteConfigDto {
  @ApiProperty({ description: '背景图URL', required: false })
  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @ApiProperty({ description: '网站开始运行时间', required: false })
  @IsOptional()
  @IsDateString()
  siteStartedAt?: string;

  @ApiProperty({ description: '页脚一句话', required: false })
  @IsOptional()
  @IsString()
  footerText?: string;
}
