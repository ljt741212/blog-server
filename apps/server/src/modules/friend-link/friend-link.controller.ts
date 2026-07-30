import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  ApplyFriendLinkDto,
  BatchSortDto,
  FindAllQueryDto,
  IdParamDto,
  SaveFriendLinkDto,
  UpdateFriendLinkStatusDto,
} from './friend-link.dto';
import { FriendLinkService } from './friend-link.service';

@Controller('friend-links')
export class FriendLinkController {
  constructor(private readonly friendLinkService: FriendLinkService) {}

  @Get()
  findAll(@Query() query: FindAllQueryDto) {
    return this.friendLinkService.findAll(query.status, query.sortOrder);
  }

  @Post('apply')
  apply(@Body() dto: ApplyFriendLinkDto) {
    return this.friendLinkService.apply(dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  save(@Body() dto: SaveFriendLinkDto) {
    return this.friendLinkService.save(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param() params: IdParamDto, @Body() dto: SaveFriendLinkDto) {
    return this.friendLinkService.update(params.id, dto);
  }

  @Patch('sort')
  @UseGuards(JwtAuthGuard)
  batchSort(@Body() dto: BatchSortDto) {
    return this.friendLinkService.batchSort(dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateFriendLinkStatusDto,
  ) {
    return this.friendLinkService.updateStatus(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.friendLinkService.remove(params.id);
  }
}
