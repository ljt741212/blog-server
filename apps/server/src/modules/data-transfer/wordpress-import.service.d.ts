import { Repository } from 'typeorm';
import { Category } from "../../../../../src/modules/category/category.entity";
import { OssService } from "../../../../../src/modules/oss/oss.service";
import { Post } from "../../../../../src/modules/post/post.entity";
import { Tag } from "../../../../../src/modules/tag/tag.entity";
import { User } from "../../../../../src/modules/user/user.entity";
export declare class WordPressImportService {
    private readonly postRepo;
    private readonly categoryRepo;
    private readonly tagRepo;
    private readonly userRepo;
    private readonly ossService;
    private readonly logger;
    private readonly turndown;
    constructor(postRepo: Repository<Post>, categoryRepo: Repository<Category>, tagRepo: Repository<Tag>, userRepo: Repository<User>, ossService: OssService);
    importFromXml(filePath: string): Promise<{
        posts: number;
        skipped: number;
        images: number;
        imageFails: number;
        errors: string[];
    }>;
    private resolveAuthor;
    private resolveCategory;
    private resolveTags;
    private replaceImages;
    private uploadOne;
    private parseDate;
    private extractSummary;
}
