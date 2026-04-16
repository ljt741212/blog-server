import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import {
  CreateGuestMessageDto,
  GuestMessageAdminPageQueryDto,
  GuestMessageIdParamDto,
  GuestMessageListQueryDto,
  UpdateGuestMessageStatusDto,
} from './guest-message.dto';
import { GuestMessageService } from './guest-message.service';

@Controller('guest-messages')
export class GuestMessageController {
  constructor(private readonly guestMessageService: GuestMessageService) {}

  @Post()
  create(@Body() dto: CreateGuestMessageDto) {
    return this.guestMessageService.create(dto);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param() params: GuestMessageIdParamDto,
    @Body() dto: UpdateGuestMessageStatusDto,
  ) {
    return this.guestMessageService.updateStatus(params.id, dto.status);
  }

  @Get('page')
  paginate(@Query() query: GuestMessageAdminPageQueryDto) {
    return this.guestMessageService.paginateForAdmin(query);
  }

  @Get()
  findList(@Query() query: GuestMessageListQueryDto) {
    return this.guestMessageService.findList(query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param() params: GuestMessageIdParamDto) {
    return this.guestMessageService.remove(params.id);
  }
}
