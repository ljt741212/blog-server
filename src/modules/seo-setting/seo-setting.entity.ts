import { Column, Entity } from 'typeorm';

import { CommonEntity } from '@/common/entity/common.entity';

@Entity('seo_settings')
export class SeoSetting extends CommonEntity {
  @Column({ type: 'varchar', length: 255, comment: '标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '关键词' })
  keywords: string;

  @Column({
    name: 'sitemap_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Sitemap URL',
  })
  sitemapUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'Robots设置' })
  robots: string;

  @Column({
    name: 'canonical_url',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Canonical URL',
  })
  canonicalUrl: string;

  @Column({
    name: 'og_title',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Open Graph标题',
  })
  ogTitle: string;

  @Column({
    name: 'og_description',
    type: 'text',
    nullable: true,
    comment: 'Open Graph描述',
  })
  ogDescription: string;

  @Column({
    name: 'og_image',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Open Graph图片',
  })
  ogImage: string;

  @Column({
    name: 'schema_markup',
    type: 'text',
    nullable: true,
    comment: 'Schema标记',
  })
  schemaMarkup: string;

  @Column({
    name: 'meta_author',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Meta作者',
  })
  metaAuthor: string;

  @Column({
    name: 'meta_viewport',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Meta视口',
  })
  metaViewport: string;
}
