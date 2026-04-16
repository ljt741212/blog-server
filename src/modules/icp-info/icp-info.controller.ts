import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { SaveIcpInfoDto } from './icp-info.dto';
import { IcpInfoService } from './icp-info.service';

@Controller('icp-info')
export class IcpInfoController {
  constructor(private readonly icpInfoService: IcpInfoService) {}

  @Get('latest')
  getLatest() {
    return this.icpInfoService.getLatest();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveIcpInfoDto) {
    return this.icpInfoService.save(dto);
  }
}
