import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  IdParamDto,
  SaveTagDto,
  TagPageQueryDto,
  UpdateTagDto,
} from './tag.dto';
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('page')
  @UseGuards(JwtAuthGuard)
  paginate(@Query() query: TagPageQueryDto) {
    return this.tagService.paginateForAdmin(query);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: IdParamDto) {
    return this.tagService.findOne(params.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveTagDto) {
    return this.tagService.save(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param() params: IdParamDto, @Body() dto: UpdateTagDto) {
    return this.tagService.update(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.tagService.remove(params.id);
  }
}
