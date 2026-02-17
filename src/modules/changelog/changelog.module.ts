import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { ChangelogController } from './changelog.controller';
import { Changelog } from './changelog.entity';
import { ChangelogService } from './changelog.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Changelog]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [ChangelogController],
  providers: [ChangelogService, JwtAuthGuard],
  exports: [ChangelogService],
})
export class ChangelogModule {}
