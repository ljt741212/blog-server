import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

import { JwtAuthGuard } from '@/common';

import { SaveFriendLinkDto } from './friend-link.dto';
import { FriendLinkService } from './friend-link.service';

class IdParamDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

@Controller('friend-links')
export class FriendLinkController {
  constructor(private readonly friendLinkService: FriendLinkService) {}

  @Get()
  findAll() {
    return this.friendLinkService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: SaveFriendLinkDto) {
    return this.friendLinkService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param() params: IdParamDto, @Body() dto: SaveFriendLinkDto) {
    return this.friendLinkService.update(params.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: IdParamDto) {
    return this.friendLinkService.remove(params.id);
  }
}
