import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { TrackVisitDto } from './dto/track-visit.dto';
import { VisitorPageQueryDto } from './dto/visitor-page-query.dto';
import { OnlineStreamService } from './online-stream.service';
import { VisitorService } from './visitor.service';

import type { Request } from 'express';

@Controller('visitor')
export class VisitorController {
  constructor(
    private readonly visitorService: VisitorService,
    private readonly onlineStreamService: OnlineStreamService,
  ) {}

  @Post('visit')
  async recordVisit(@Body() body: Partial<TrackVisitDto>, @Req() req: Request) {
    const visitorId =
      (req.headers['x-visitor-id'] as string) ||
      (req.headers['visitor-id'] as string) ||
      '';

    const dto: TrackVisitDto = {
      visitorId: visitorId || (body.visitorId ?? ''),
      url: body.url ?? '',
      referrer: body.referrer,
      userAgent: body.userAgent,
    };

    await this.visitorService.recordVisit(dto, req);

    return { success: true };
  }

  /** 心跳：仅更新 last_active_at，不写访问日志（前端可定时调用） */
  @Post('heartbeat')
  async heartbeat(@Body() body: Partial<TrackVisitDto>, @Req() req: Request) {
    const visitorId =
      (req.headers['x-visitor-id'] as string) ||
      (req.headers['visitor-id'] as string) ||
      '';
    const dto: TrackVisitDto = {
      visitorId: visitorId || (body.visitorId ?? ''),
      url: body.url ?? '',
      referrer: body.referrer,
      userAgent: body.userAgent,
    };
    await this.visitorService.recordHeartbeat(dto, req);
    return { success: true };
  }

  @Get('page')
  @UseGuards(JwtAuthGuard)
  paginate(@Query() query: VisitorPageQueryDto) {
    return this.visitorService.paginateForAdmin(query);
  }

  @Sse('online/stream')
  @UseGuards(JwtAuthGuard)
  streamOnline(@Query('minutes') minutesStr?: string) {
    const minutes = minutesStr ? Math.max(1, parseInt(minutesStr, 10) || 5) : 5;
    return this.onlineStreamService.getStream(minutes);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard() {
    return this.visitorService.getDashboardStats();
  }
}
