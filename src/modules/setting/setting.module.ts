import { Module } from '@nestjs/common';

import { IcpInfoModule } from '@/modules/icp-info/icp-info.module';
import { SeoSettingModule } from '@/modules/seo-setting/seo-setting.module';
import { SiteConfigModule } from '@/modules/site-config/site-config.module';

import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [SeoSettingModule, IcpInfoModule, SiteConfigModule],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
