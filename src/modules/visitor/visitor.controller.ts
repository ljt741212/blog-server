import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '@/common';

import { TrackVisitDto } from './dto/track-visit.dto';
import { VisitorService } from './visitor.service';

import type { Request } from 'express';

@Controller('visitor')
export class VisitorController {
  constructor(private readonly visitorService: VisitorService) {}

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.visitorService.findAllVisitors();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard() {
    return this.visitorService.getDashboardStats();
  }
}
