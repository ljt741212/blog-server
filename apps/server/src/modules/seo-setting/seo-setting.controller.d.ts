import { CreateSeoSettingDto } from './seo-setting.dto';
import { SeoSettingService } from './seo-setting.service';
export declare class SeoSettingController {
    private readonly seoSettingService;
    constructor(seoSettingService: SeoSettingService);
    getSeoSetting(): Promise<import("./seo-setting.entity").SeoSetting>;
    save(dto: CreateSeoSettingDto): Promise<import("./seo-setting.entity").SeoSetting>;
}
