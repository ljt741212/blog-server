import { Injectable } from '@nestjs/common';

import { FriendLinkService } from '@/modules/friend-link/friend-link.service';
import { IcpInfoService } from '@/modules/icp-info/icp-info.service';
import { SeoSettingService } from '@/modules/seo-setting/seo-setting.service';

import { SaveSettingDto } from './setting.dto';

@Injectable()
export class SettingService {
  constructor(
    private readonly seoSettingService: SeoSettingService,
    private readonly friendLinkService: FriendLinkService,
    private readonly icpInfoService: IcpInfoService,
  ) {}

  async getAll() {
    const [seo, links, icp] = await Promise.all([
      this.seoSettingService.getSeoSetting(),
      this.friendLinkService.findAll(),
      this.icpInfoService.getLatest(),
    ]);

    return { seo, links, icp };
  }

  async save(dto: SaveSettingDto) {
    const [seo, links, icp] = await Promise.all([
      dto.seo
        ? this.seoSettingService.save(dto.seo)
        : this.seoSettingService.getSeoSetting(),
      this.friendLinkService.replaceAll(dto.links ?? []),
      dto.icp
        ? this.icpInfoService.save(dto.icp)
        : this.icpInfoService.getLatest(),
    ]);

    return { seo, links, icp };
  }
}
