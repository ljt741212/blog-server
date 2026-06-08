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

import { JwtAuthGuard, SuperAdminGuard } from '@/common';

import { ChatDto, SaveAiConfigDto, UsageQueryDto } from './ai.dto';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto.messages, dto.action);
  }

  @Get('configs')
  @UseGuards(JwtAuthGuard)
  getConfigs() {
    return this.aiService.getConfigs();
  }

  @Post('configs/save')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  saveConfig(@Body() dto: SaveAiConfigDto) {
    return this.aiService.saveConfig(dto);
  }

  @Delete('configs/:id')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  deleteConfig(@Param('id') id: number) {
    return this.aiService.deleteConfig(id);
  }

  @Patch('configs/:id/activate')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  activateConfig(@Param('id') id: number) {
    return this.aiService.activateConfig(id);
  }

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  getUsage(@Query() query: UsageQueryDto) {
    return this.aiService.getUsage(query);
  }
}
