import { Repository } from 'typeorm';
import { SaveSiteConfigDto } from './site-config.dto';
import { SiteConfig } from './site-config.entity';
export declare class SiteConfigService {
    private readonly repo;
    constructor(repo: Repository<SiteConfig>);
    get(): Promise<SiteConfig | null>;
    save(dto: SaveSiteConfigDto): Promise<SiteConfig>;
}
