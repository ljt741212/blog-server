import { Controller, Get } from '@nestjs/common';

import { SeoSettingService } from './seo-setting.service';

@Controller('seo-settings')
export class SeoSettingController {
  constructor(private readonly seoSettingService: SeoSettingService) {}

  @Get('latest')
  getSeoSetting() {
    return this.seoSettingService.getSeoSetting();
  }
}
