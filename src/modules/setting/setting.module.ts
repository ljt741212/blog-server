import { Module } from '@nestjs/common';

import { FriendLinkModule } from '@/modules/friend-link/friend-link.module';
import { IcpInfoModule } from '@/modules/icp-info/icp-info.module';
import { SeoSettingModule } from '@/modules/seo-setting/seo-setting.module';
import { SiteConfigModule } from '@/modules/site-config/site-config.module';

import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [
    SeoSettingModule,
    FriendLinkModule,
    IcpInfoModule,
    SiteConfigModule,
  ],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
