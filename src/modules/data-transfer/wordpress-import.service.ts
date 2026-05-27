import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { XMLParser } from 'fast-xml-parser';
import TurndownService from 'turndown';
import { Repository } from 'typeorm';

import { Category, CategoryStatus } from '@/modules/category/category.entity';
import { OssService } from '@/modules/oss/oss.service';
import { Post, PostStatus } from '@/modules/post/post.entity';
import { Tag, TagStatus } from '@/modules/tag/tag.entity';
import { User } from '@/modules/user/user.entity';

// ── WXR types ──

interface WxrItem {
  title: string;
  creator: string;
  encoded: string | string[];
  post_type: string;
  status: string;
  post_date: string;
  post_name: string;
  post_id: number;
  attachment_url?: string;
  category?: Array<{ domain: string; nicename: string; '#text': string }>;
  postmeta?: Array<{ meta_key: string; meta_value: any }>;
}

// ── helpers ──

function catText(cat: NonNullable<WxrItem['category']>[number]): string {
  return (cat['#text'] || '').trim();
}

function metaStr(
  postmeta: WxrItem['postmeta'] | undefined,
  key: string,
): string {
  if (!postmeta) return '';
  const found = postmeta.find((m) => m.meta_key === key);
  if (!found || found.meta_value == null) return '';
  return typeof found.meta_value === 'string'
    ? found.meta_value
    : String(found.meta_value);
}

function downloadBuffer(
  url: string,
): Promise<{ buffer: Buffer; mime: string } | null> {
  return new Promise((resolve) => {
    const transport = url.startsWith('https') ? https : http;
    const req = transport.get(
      url,
      { timeout: 30000, headers: { 'User-Agent': 'blog-import/1.0' } },
      (res) => {
        // Follow redirects (up to 3 hops)
        if ([301, 302, 307, 308].includes(res.statusCode ?? 0)) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            resolve(downloadBuffer(redirectUrl));
            return;
          }
        }
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          resolve(null);
          return;
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            buffer: Buffer.concat(chunks),
            mime: res.headers['content-type'] || 'image/png',
          });
        });
        res.on('error', () => resolve(null));
      },
    );
    req.on('error', () => resolve(null));
    req.setTimeout(30000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// ── service ──

@Injectable()
export class WordPressImportService {
  private readonly logger = new Logger(WordPressImportService.name);
  private readonly turndown: TurndownService;

  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly ossService: OssService,
  ) {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
    });

    this.turndown.addRule('fencedCodeBlock', {
      filter: (node) => {
        return !!(
          node.nodeName === 'PRE' &&
          node.firstChild &&
          node.firstChild.nodeName === 'CODE'
        );
      },
      replacement: (_content, node) => {
        const codeEl = node.firstChild as HTMLElement;
        const className = codeEl.getAttribute('class') || '';
        const lang = className.replace(/^language-/, '').trim();
        const text = codeEl.textContent || '';
        return '\n\n```' + lang + '\n' + text + '\n```\n\n';
      },
    });
  }

  // ── public ──

  async importFromXml(filePath: string) {
    const xml = fs.readFileSync(filePath, 'utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      removeNSPrefix: true,
      isArray: (name) => ['item', 'postmeta', 'category'].includes(name),
    });

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
    const parsed = parser.parse(xml);
    const items: WxrItem[] = (parsed?.rss?.channel?.item as WxrItem[]) || [];
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

    // Attachment id → URL map (used for _thumbnail_id lookups)
    const attachmentMap = new Map<number, string>();
    for (const item of items) {
      if (item.post_type === 'attachment' && item.attachment_url) {
        attachmentMap.set(item.post_id, item.attachment_url);
      }
    }

    const stats = {
      posts: 0,
      skipped: 0,
      images: 0,
      imageFails: 0,
      errors: [] as string[],
    };

    // Global URL→OSS cache so the same image is only downloaded once across all posts
    const urlCache = new Map<string, string>();

    for (const item of items) {
      if (item.post_type !== 'post') continue;

      try {
        const title = item.title?.trim();
        if (!title) {
          stats.skipped++;
          continue;
        }

        const authorLogin = item.creator || 'ljt';
        const author = await this.resolveAuthor(authorLogin);
        const postCategory = await this.resolveCategory(item.category);
        const tags = await this.resolveTags(item.category);

        const views = parseInt(metaStr(item.postmeta, 'views'), 10) || 0;
        const likes = parseInt(metaStr(item.postmeta, 'bigfa_ding'), 10) || 0;

        // Content
        const encoded = item.encoded;
        const htmlContent = Array.isArray(encoded)
          ? encoded.join('')
          : encoded || '';

        // Replace images: download → OSS → replace URLs.  Uses global cache.
        const { html: processedHtml, firstImage } = await this.replaceImages(
          htmlContent,
          urlCache,
          stats,
        );

        // Cover image: _thumbnail_id first, then first image in content
        let coverImage: string | null = null;
        const thumbnailId =
          parseInt(metaStr(item.postmeta, '_thumbnail_id'), 10) || 0;
        if (thumbnailId && attachmentMap.has(thumbnailId)) {
          const ossUrl = await this.uploadOne(
            attachmentMap.get(thumbnailId)!,
            urlCache,
            stats,
          );
          if (ossUrl) coverImage = ossUrl;
        }
        if (!coverImage) coverImage = firstImage;

        const markdown = this.turndown.turndown(processedHtml);

        let slug = (item.post_name || '').trim();
        try {
          slug = decodeURIComponent(slug);
        } catch {
          /* keep raw */
        }

        const post = this.postRepo.create({
          title,
          content: markdown,
          slug: slug || undefined,
          coverImage: coverImage || undefined,
          summary: this.extractSummary(markdown),
          status:
            item.status === 'publish' ? PostStatus.PUBLISHED : PostStatus.DRAFT,
          publishTime: item.post_date ? new Date(item.post_date) : null,
          views,
          likes,
          user: author,
          category: postCategory,
          tags,
        });

        await this.postRepo.save(post);
        stats.posts++;
      } catch (err: unknown) {
        const label = item.title || `post_id=${item.post_id}`;
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`${label}: ${msg}`);
        this.logger.error(`WordPress import error [${label}]`, err);
      }
    }

    try {
      fs.unlinkSync(filePath);
    } catch {
      /* ignore */
    }

    return stats;
  }

  // ── private: entities ──

  private async resolveAuthor(login: string): Promise<User> {
    let user = await this.userRepo.findOneBy({ username: login });
    if (!user) {
      user = await this.userRepo.findOneBy({ email: '1366490955@qq.com' });
    }
    if (!user) {
      user = (await this.userRepo.find({ order: { id: 'ASC' }, take: 1 }))[0];
    }
    if (!user) {
      throw new Error('No user found in database to assign as author');
    }
    return user;
  }

  private async resolveCategory(
    cats: WxrItem['category'],
  ): Promise<Category | undefined> {
    if (!cats || !Array.isArray(cats)) return undefined;
    const name = catText(cats.find((c) => c.domain === 'category') ?? cats[0]);
    if (!name || name === '未分类') return undefined;

    let cat = await this.categoryRepo.findOneBy({ name });
    if (!cat) {
      cat = this.categoryRepo.create({ name, status: CategoryStatus.ENABLED });
      await this.categoryRepo.save(cat);
    }
    return cat;
  }

  private async resolveTags(cats: WxrItem['category']): Promise<Tag[]> {
    if (!cats || !Array.isArray(cats)) return [];
    const names = cats
      .filter((c) => c.domain === 'post_tag')
      .map(catText)
      .filter(Boolean);

    const result: Tag[] = [];
    for (const name of names) {
      let tag = await this.tagRepo.findOneBy({ name });
      if (!tag) {
        tag = this.tagRepo.create({ name, status: TagStatus.ENABLED });
        await this.tagRepo.save(tag);
      }
      result.push(tag);
    }
    return result;
  }

  // ── private: images ──

  /**
   * Find all <img> in HTML, deduplicate by src, download in parallel,
   * upload to OSS, replace URLs.
   */
  private async replaceImages(
    html: string,
    urlCache: Map<string, string>,
    stats: { images: number; imageFails: number },
  ): Promise<{ html: string; firstImage: string | null }> {
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

    // Collect unique src URLs
    const srcSet = new Set<string>();
    const matches: Array<{ old: string; src: string }> = [];
    for (const m of html.matchAll(imgRegex)) {
      const src = m[1];
      if (!srcSet.has(src)) {
        srcSet.add(src);
        matches.push({ old: m[0], src });
      }
    }

    if (matches.length === 0) return { html, firstImage: null };

    // Concurrently upload all unique images
    const results = await Promise.all(
      matches.map((m) =>
        this.uploadOne(m.src, urlCache, stats).then((ossUrl) => ({
          ...m,
          ossUrl,
        })),
      ),
    );

    // Apply replacements
    let result = html;
    let firstImage: string | null = null;
    for (const r of results) {
      if (r.ossUrl) {
        const newImg = r.old.replace(r.src, r.ossUrl);
        result = result.replace(r.old, newImg);
        if (!firstImage) firstImage = r.ossUrl;
      }
    }

    return { html: result, firstImage };
  }

  private async uploadOne(
    src: string,
    urlCache: Map<string, string>,
    stats: { images: number; imageFails: number },
  ): Promise<string | null> {
    const cached = urlCache.get(src);
    if (cached) return cached;

    const dl = await downloadBuffer(src);
    if (!dl) {
      stats.imageFails++;
      this.logger.warn(`Failed to download: ${src}`);
      return null;
    }

    const filename = path.basename(new URL(src).pathname) || 'image.png';
    const mockFile = {
      buffer: dl.buffer,
      originalname: filename,
      size: dl.buffer.length,
      mimetype: dl.mime,
    } as Express.Multer.File;

    try {
      const result = await this.ossService.upload(mockFile, 'wordpress');
      urlCache.set(src, result.url);
      stats.images++;
      return result.url;
    } catch (err: unknown) {
      stats.imageFails++;
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to upload to OSS: ${src}`, msg);
      return null;
    }
  }

  // ── private: summary ──

  private extractSummary(markdown: string): string | undefined {
    const plain = markdown
      .replace(/^#{1,6}\s+.*$/gm, '') // headings
      .replace(/```[\s\S]*?```/g, '') // code blocks
      .replace(/`[^`]+`/g, '') // inline code
      .replace(/!\[.*?\]\([^)]+\)/g, '') // images
      .replace(/[*_~>]/g, '') // formatting chars
      .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1') // links → text
      .trim();

    const firstParagraph = plain.split(/\n\n+/)[0] || '';
    const text = firstParagraph.replace(/\n/g, ' ').trim();

    if (!text) return undefined;
    return text.length <= 500
      ? text
      : text.slice(0, 500).replace(/\s+\S*$/, '');
  }
}
