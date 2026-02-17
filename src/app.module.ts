import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import config from './config';
import { CategoryModule } from './modules/category/category.module';
import { ChangelogModule } from './modules/changelog/changelog.module';
import { CommentModule } from './modules/comment/comment.module';
import { FriendLinkModule } from './modules/friend-link/friend-link.module';
import { GuestMessageModule } from './modules/guest-message/guest-message.module';
import { IcpInfoModule } from './modules/icp-info/icp-info.module';
import { OssModule } from './modules/oss/oss.module';
import { PostModule } from './modules/post/post.module';
import { SeoSettingModule } from './modules/seo-setting/seo-setting.module';
import { SettingModule } from './modules/setting/setting.module';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { VisitorModule } from './modules/visitor/visitor.module';
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
    DatabaseModule,
    EntitiesModule,
    SeoSettingModule,
    FriendLinkModule,
    GuestMessageModule,
    IcpInfoModule,
    SettingModule,
    TagModule,
    CategoryModule,
    UserModule,
    PostModule,
    CommentModule,
    ChangelogModule,
    VisitorModule,
    OssModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
