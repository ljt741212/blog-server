import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSeoSettingDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '关键词' })
  @IsString()
  keywords: string;

  @ApiProperty({ description: 'Sitemap URL' })
  @IsString()
  sitemapUrl: string;

  @ApiProperty({ description: 'Robots设置' })
  @IsString()
  robots: string;

  @ApiProperty({ description: 'Canonical URL' })
  @IsString()
  canonicalUrl: string;

  @ApiProperty({ description: 'Open Graph标题' })
  @IsString()
  ogTitle: string;

  @ApiProperty({ description: 'Open Graph描述' })
  @IsString()
  ogDescription: string;

  @ApiProperty({ description: 'Open Graph图片' })
  @IsString()
  ogImage: string;

  @ApiProperty({ description: 'Schema标记' })
  @IsString()
  schemaMarkup: string;

  @ApiProperty({ description: 'Meta作者' })
  @IsString()
  metaAuthor: string;

  @ApiProperty({ description: 'Meta视口' })
  @IsString()
  metaViewport: string;
}
