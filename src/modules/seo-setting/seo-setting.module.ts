import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeoSettingController } from './seo-setting.controller';
import { SeoSetting } from './seo-setting.entity';
import { SeoSettingService } from './seo-setting.service';

@Module({
  imports: [TypeOrmModule.forFeature([SeoSetting])],
  controllers: [SeoSettingController],
  providers: [SeoSettingService],
  exports: [SeoSettingService],
})
export class SeoSettingModule {}
