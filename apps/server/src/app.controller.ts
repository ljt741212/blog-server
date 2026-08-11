import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Bypass } from './common/decorators/bypass.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('bypass')
  @Bypass()
  getHelloBypass(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Bypass()
  health() {
    return { status: 'ok', timestamp: Date.now() };
  }
}
