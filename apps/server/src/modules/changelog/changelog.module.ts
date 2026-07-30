import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChangelogController } from './changelog.controller';
import { Changelog } from './changelog.entity';
import { ChangelogService } from './changelog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Changelog])],
  controllers: [ChangelogController],
  providers: [ChangelogService],
  exports: [ChangelogService],
})
export class ChangelogModule {}
