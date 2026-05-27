import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { SaveSettingDto } from './setting.dto';
import { SettingService } from './setting.service';

@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.settingService.getAll();
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveSettingDto) {
    return this.settingService.save(dto);
  }
}
