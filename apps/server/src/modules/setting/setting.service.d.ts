import { IcpInfoService } from "../../../../../src/modules/icp-info/icp-info.service";
import { SeoSettingService } from "../../../../../src/modules/seo-setting/seo-setting.service";
import { SiteConfigService } from "../../../../../src/modules/site-config/site-config.service";
import { SaveSettingDto } from './setting.dto';
export declare class SettingService {
    private readonly seoSettingService;
    private readonly icpInfoService;
    private readonly siteConfigService;
    constructor(seoSettingService: SeoSettingService, icpInfoService: IcpInfoService, siteConfigService: SiteConfigService);
    getAll(): Promise<{
        seo: import("../../../../../src/modules/seo-setting/seo-setting.entity").SeoSetting;
        icp: import("../../../../../src/modules/icp-info/icp-info.entity").IcpInfo;
        siteConfig: import("../../../../../src/modules/site-config/site-config.entity").SiteConfig | null;
    }>;
    save(dto: SaveSettingDto): Promise<{
        seo: import("../../../../../src/modules/seo-setting/seo-setting.entity").SeoSetting;
        icp: import("../../../../../src/modules/icp-info/icp-info.entity").IcpInfo;
        siteConfig: import("../../../../../src/modules/site-config/site-config.entity").SiteConfig | null;
    }>;
}
