import { Injectable } from '@nestjs/common';

import { IcpInfoService } from '@/modules/icp-info/icp-info.service';
import { SeoSettingService } from '@/modules/seo-setting/seo-setting.service';
import { SiteConfigService } from '@/modules/site-config/site-config.service';

import { SaveSettingDto } from './setting.dto';

@Injectable()
export class SettingService {
  constructor(
    private readonly seoSettingService: SeoSettingService,
    private readonly icpInfoService: IcpInfoService,
    private readonly siteConfigService: SiteConfigService,
  ) {}

  async getAll() {
    const [seo, icp, siteConfig] = await Promise.all([
      this.seoSettingService.getSeoSetting(),
      this.icpInfoService.getLatest(),
      this.siteConfigService.get(),
    ]);

    return { seo, icp, siteConfig };
  }

  async save(dto: SaveSettingDto) {
    const [seo, icp, siteConfig] = await Promise.all([
      dto.seo
        ? this.seoSettingService.save(dto.seo)
        : this.seoSettingService.getSeoSetting(),
      dto.icp
        ? this.icpInfoService.save(dto.icp)
        : this.icpInfoService.getLatest(),
      dto.siteConfig
        ? this.siteConfigService.save(dto.siteConfig)
        : this.siteConfigService.get(),
    ]);

    return { seo, icp, siteConfig };
  }
}
