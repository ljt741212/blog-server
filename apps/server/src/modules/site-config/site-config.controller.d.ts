import { SaveSiteConfigDto } from './site-config.dto';
import { SiteConfigService } from './site-config.service';
export declare class SiteConfigController {
    private readonly siteConfigService;
    constructor(siteConfigService: SiteConfigService);
    get(): Promise<import("./site-config.entity").SiteConfig | null>;
    save(dto: SaveSiteConfigDto): Promise<import("./site-config.entity").SiteConfig>;
}
