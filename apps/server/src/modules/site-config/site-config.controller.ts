import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { SaveSiteConfigDto } from './site-config.dto';
import { SiteConfigService } from './site-config.service';

@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  get() {
    return this.siteConfigService.get();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveSiteConfigDto) {
    return this.siteConfigService.save(dto);
  }
}
