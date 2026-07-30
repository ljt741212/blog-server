import { SaveSettingDto } from './setting.dto';
import { SettingService } from './setting.service';
export declare class SettingController {
    private readonly settingService;
    constructor(settingService: SettingService);
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
