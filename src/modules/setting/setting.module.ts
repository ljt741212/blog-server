import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';
import { FriendLinkModule } from '@/modules/friend-link/friend-link.module';
import { IcpInfoModule } from '@/modules/icp-info/icp-info.module';
import { SeoSettingModule } from '@/modules/seo-setting/seo-setting.module';

import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [
    SeoSettingModule,
    FriendLinkModule,
    IcpInfoModule,
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [SettingController],
  providers: [SettingService, JwtAuthGuard],
})
export class SettingModule {}
