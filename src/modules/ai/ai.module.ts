import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AiConfig } from './ai-config.entity';
import { AiUsage } from './ai-usage.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiConfig, AiUsage])],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
