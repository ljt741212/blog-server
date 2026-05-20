import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  AnnouncementPageQueryDto,
  IdParamDto,
  SaveAnnouncementDto,
} from './announcement.dto';
import { AnnouncementService } from './announcement.service';

@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get('page')
  @UseGuards(JwtAuthGuard)
  paginate(@Query() query: AnnouncementPageQueryDto) {
    return this.announcementService.paginateForAdmin(query);
  }

  @Get()
  findAll() {
    return this.announcementService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.announcementService.findOne(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveAnnouncementDto) {
    return this.announcementService.save(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.announcementService.remove(params.id);
  }
}
