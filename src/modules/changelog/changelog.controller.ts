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
  ChangelogPageQueryDto,
  IdParamDto,
  SaveChangelogDto,
  UpdateChangelogStatusDto,
} from './changelog.dto';
import { ChangelogService } from './changelog.service';

@Controller('changelogs')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get('page')
  paginate(@Query() query: ChangelogPageQueryDto) {
    return this.changelogService.paginateForAdmin(query);
  }

  @Get()
  findAll() {
    return this.changelogService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.changelogService.findOne(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveChangelogDto) {
    return this.changelogService.save(dto);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateChangelogStatusDto,
  ) {
    return this.changelogService.updateStatus(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.changelogService.remove(params.id);
  }
}
