import { SaveIcpInfoDto } from "../../../../../src/modules/icp-info/icp-info.dto";
import { CreateSeoSettingDto } from "../../../../../src/modules/seo-setting/seo-setting.dto";
import { SaveSiteConfigDto } from "../../../../../src/modules/site-config/site-config.dto";
export declare class SaveSettingDto {
    seo: CreateSeoSettingDto;
    icp?: SaveIcpInfoDto;
    siteConfig?: SaveSiteConfigDto;
}
