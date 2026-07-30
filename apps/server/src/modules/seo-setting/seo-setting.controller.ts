import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { CreateSeoSettingDto } from './seo-setting.dto';
import { SeoSettingService } from './seo-setting.service';

@Controller('seo-settings')
export class SeoSettingController {
  constructor(private readonly seoSettingService: SeoSettingService) {}

  @Get('latest')
  getSeoSetting() {
    return this.seoSettingService.getSeoSetting();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: CreateSeoSettingDto) {
    return this.seoSettingService.save(dto);
  }
}
