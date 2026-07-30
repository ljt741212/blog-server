"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WordPressImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordPressImportService = void 0;
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const path = __importStar(require("path"));
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const fast_xml_parser_1 = require("fast-xml-parser");
const turndown_1 = __importDefault(require("turndown"));
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../../../../src/modules/category/category.entity");
const oss_service_1 = require("../../../../../src/modules/oss/oss.service");
const post_entity_1 = require("../../../../../src/modules/post/post.entity");
const tag_entity_1 = require("../../../../../src/modules/tag/tag.entity");
const user_entity_1 = require("../../../../../src/modules/user/user.entity");
function catText(cat) {
    return (cat['#text'] || '').trim();
}
function metaStr(postmeta, key) {
    if (!postmeta)
        return '';
    const found = postmeta.find((m) => m.meta_key === key);
    if (!found || found.meta_value == null)
        return '';
    return typeof found.meta_value === 'string'
        ? found.meta_value
        : String(found.meta_value);
}
function downloadBuffer(url, maxRedirects = 5) {
    return new Promise((resolve) => {
        const transport = url.startsWith('https') ? https : http;
        const req = transport.get(url, { timeout: 30000, headers: { 'User-Agent': 'blog-import/1.0' } }, (res) => {
            if ([301, 302, 307, 308].includes(res.statusCode ?? 0)) {
                res.resume();
                if (maxRedirects <= 0) {
                    resolve(null);
                    return;
                }
                const redirectUrl = res.headers.location;
                if (redirectUrl) {
                    resolve(downloadBuffer(redirectUrl, maxRedirects - 1));
                }
                else {
                    resolve(null);
                }
                return;
            }
            if (!res.statusCode || res.statusCode >= 400) {
                res.resume();
                resolve(null);
                return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                resolve({
                    buffer: Buffer.concat(chunks),
                    mime: res.headers['content-type'] || 'image/png',
                });
            });
            res.on('error', () => resolve(null));
        });
        req.on('error', () => resolve(null));
        req.setTimeout(30000, () => {
            req.destroy();
            resolve(null);
        });
    });
}
let WordPressImportService = WordPressImportService_1 = class WordPressImportService {
    postRepo;
    categoryRepo;
    tagRepo;
    userRepo;
    ossService;
    logger = new common_1.Logger(WordPressImportService_1.name);
    turndown;
    constructor(postRepo, categoryRepo, tagRepo, userRepo, ossService) {
        this.postRepo = postRepo;
        this.categoryRepo = categoryRepo;
        this.tagRepo = tagRepo;
        this.userRepo = userRepo;
        this.ossService = ossService;
        this.turndown = new turndown_1.default({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            emDelimiter: '*',
        });
        this.turndown.addRule('fencedCodeBlock', {
            filter: (node) => {
                return !!(node.nodeName === 'PRE' &&
                    node.firstChild &&
                    node.firstChild.nodeName === 'CODE');
            },
            replacement: (_content, node) => {
                const codeEl = node.firstChild;
                const className = codeEl.getAttribute('class') || '';
                const lang = className.replace(/^language-/, '').trim();
                const text = codeEl.textContent || '';
                return '\n\n```' + lang + '\n' + text + '\n```\n\n';
            },
        });
    }
    async importFromXml(filePath) {
        const xml = fs.readFileSync(filePath, 'utf-8');
        const parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            removeNSPrefix: true,
            isArray: (name) => ['item', 'postmeta', 'category'].includes(name),
        });
        const parsed = parser.parse(xml);
        const items = parsed?.rss?.channel?.item || [];
        const attachmentMap = new Map();
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
            errors: [],
        };
        const urlCache = new Map();
        for (const item of items) {
            if (item.post_type !== 'post')
                continue;
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
                const encoded = item.encoded;
                const htmlContent = Array.isArray(encoded)
                    ? encoded.join('')
                    : encoded || '';
                const { html: processedHtml, firstImage } = await this.replaceImages(htmlContent, urlCache, stats);
                let coverImage = null;
                const thumbnailId = parseInt(metaStr(item.postmeta, '_thumbnail_id'), 10) || 0;
                if (thumbnailId && attachmentMap.has(thumbnailId)) {
                    const ossUrl = await this.uploadOne(attachmentMap.get(thumbnailId), urlCache, stats);
                    if (ossUrl)
                        coverImage = ossUrl;
                }
                if (!coverImage)
                    coverImage = firstImage;
                const markdown = this.turndown.turndown(processedHtml);
                let slug = (item.post_name || '').trim();
                try {
                    slug = decodeURIComponent(slug);
                }
                catch {
                }
                const post = this.postRepo.create({
                    title,
                    content: markdown,
                    slug: slug || undefined,
                    coverImage: coverImage || undefined,
                    summary: this.extractSummary(markdown),
                    status: item.status === 'publish' ? post_entity_1.PostStatus.PUBLISHED : post_entity_1.PostStatus.DRAFT,
                    publishTime: this.parseDate(item.post_date),
                    views,
                    likes,
                    user: author,
                    category: postCategory,
                    tags,
                });
                await this.postRepo.save(post);
                stats.posts++;
            }
            catch (err) {
                const label = item.title || `post_id=${item.post_id}`;
                const msg = err instanceof Error ? err.message : String(err);
                stats.errors.push(`${label}: ${msg}`);
                this.logger.error(`WordPress import error [${label}]`, err);
            }
        }
        try {
            fs.unlinkSync(filePath);
        }
        catch {
        }
        return stats;
    }
    async resolveAuthor(login) {
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
    async resolveCategory(cats) {
        if (!cats || !Array.isArray(cats))
            return undefined;
        const name = catText(cats.find((c) => c.domain === 'category') ?? cats[0]);
        if (!name || name === '未分类')
            return undefined;
        let cat = await this.categoryRepo.findOneBy({ name });
        if (!cat) {
            cat = this.categoryRepo.create({ name, status: category_entity_1.CategoryStatus.ENABLED });
            await this.categoryRepo.save(cat);
        }
        return cat;
    }
    async resolveTags(cats) {
        if (!cats || !Array.isArray(cats))
            return [];
        const names = cats
            .filter((c) => c.domain === 'post_tag')
            .map(catText)
            .filter(Boolean);
        const result = [];
        for (const name of names) {
            let tag = await this.tagRepo.findOneBy({ name });
            if (!tag) {
                tag = this.tagRepo.create({ name, status: tag_entity_1.TagStatus.ENABLED });
                await this.tagRepo.save(tag);
            }
            result.push(tag);
        }
        return result;
    }
    async replaceImages(html, urlCache, stats) {
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        const srcSet = new Set();
        const matches = [];
        for (const m of html.matchAll(imgRegex)) {
            const src = m[1];
            if (!srcSet.has(src)) {
                srcSet.add(src);
                matches.push({ old: m[0], src });
            }
        }
        if (matches.length === 0)
            return { html, firstImage: null };
        const results = await Promise.all(matches.map((m) => this.uploadOne(m.src, urlCache, stats).then((ossUrl) => ({
            ...m,
            ossUrl,
        }))));
        let result = html;
        let firstImage = null;
        for (const r of results) {
            if (r.ossUrl) {
                const newImg = r.old.replace(r.src, r.ossUrl);
                result = result.replace(r.old, newImg);
                if (!firstImage)
                    firstImage = r.ossUrl;
            }
        }
        return { html: result, firstImage };
    }
    async uploadOne(src, urlCache, stats) {
        const cached = urlCache.get(src);
        if (cached)
            return cached;
        const dl = await downloadBuffer(src);
        if (!dl) {
            stats.imageFails++;
            this.logger.warn(`Failed to download: ${src}`);
            return null;
        }
        let filename = 'image.png';
        try {
            filename = path.basename(new URL(src).pathname) || 'image.png';
        }
        catch {
        }
        const mockFile = {
            buffer: dl.buffer,
            originalname: filename,
            size: dl.buffer.length,
            mimetype: dl.mime,
        };
        try {
            const result = await this.ossService.upload(mockFile, 'wordpress');
            urlCache.set(src, result.url);
            stats.images++;
            return result.url;
        }
        catch (err) {
            stats.imageFails++;
            const msg = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Failed to upload to OSS: ${src}`, msg);
            return null;
        }
    }
    parseDate(raw) {
        if (!raw)
            return null;
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }
    extractSummary(markdown) {
        const plain = markdown
            .replace(/^#{1,6}\s+.*$/gm, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]+`/g, '')
            .replace(/!\[.*?\]\([^)]+\)/g, '')
            .replace(/[*_~>]/g, '')
            .replace(/\[([^\]]*)\]\([^)]+\)/g, '$1')
            .trim();
        const firstParagraph = plain.split(/\n\n+/)[0] || '';
        const text = firstParagraph.replace(/\n/g, ' ').trim();
        if (!text)
            return undefined;
        return text.length <= 500
            ? text
            : text.slice(0, 500).replace(/\s+\S*$/, '');
    }
};
exports.WordPressImportService = WordPressImportService;
exports.WordPressImportService = WordPressImportService = WordPressImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(tag_entity_1.Tag)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        oss_service_1.OssService])
], WordPressImportService);
//# sourceMappingURL=wordpress-import.service.js.map