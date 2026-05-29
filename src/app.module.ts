import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import config from './config';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { CategoryModule } from './modules/category/category.module';
import { ChangelogModule } from './modules/changelog/changelog.module';
import { CommentModule } from './modules/comment/comment.module';
import { DataTransferModule } from './modules/data-transfer/data-transfer.module';
import { EmailModule } from './modules/email/email.module';
import { FriendLinkModule } from './modules/friend-link/friend-link.module';
import { GuestMessageModule } from './modules/guest-message/guest-message.module';
import { IcpInfoModule } from './modules/icp-info/icp-info.module';
import { OssModule } from './modules/oss/oss.module';
import { PostModule } from './modules/post/post.module';
import { SeoSettingModule } from './modules/seo-setting/seo-setting.module';
import { SettingModule } from './modules/setting/setting.module';
import { SiteConfigModule } from './modules/site-config/site-config.module';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { VisitorModule } from './modules/visitor/visitor.module';
import { AuthModule } from './shared/auth/auth.module';
import { DatabaseModule } from './shared/database/database.module';
import { EntitiesModule } from './shared/database/entities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: [
        '.env.local',
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
      load: [...Object.values(config)],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    AuthModule,
    DatabaseModule,
    EntitiesModule,
    AnnouncementModule,
    SeoSettingModule,
    FriendLinkModule,
    GuestMessageModule,
    IcpInfoModule,
    SettingModule,
    SiteConfigModule,
    TagModule,
    CategoryModule,
    UserModule,
    PostModule,
    CommentModule,
    ChangelogModule,
    VisitorModule,
    OssModule,
    DataTransferModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
