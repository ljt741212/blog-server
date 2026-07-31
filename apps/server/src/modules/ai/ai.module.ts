import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnnouncementModule } from '@/modules/announcement/announcement.module';
import { CategoryModule } from '@/modules/category/category.module';
import { ChangelogModule } from '@/modules/changelog/changelog.module';
import { CommentModule } from '@/modules/comment/comment.module';
import { DataTransferModule } from '@/modules/data-transfer/data-transfer.module';
import { FriendLinkModule } from '@/modules/friend-link/friend-link.module';
import { GuestMessageModule } from '@/modules/guest-message/guest-message.module';
import { IcpInfoModule } from '@/modules/icp-info/icp-info.module';
import { OssModule } from '@/modules/oss/oss.module';
import { PostModule } from '@/modules/post/post.module';
import { SeoSettingModule } from '@/modules/seo-setting/seo-setting.module';
import { SettingModule } from '@/modules/setting/setting.module';
import { SiteConfigModule } from '@/modules/site-config/site-config.module';
import { TagModule } from '@/modules/tag/tag.module';
import { VisitorModule } from '@/modules/visitor/visitor.module';

import { AiConfig } from './ai-config.entity';
import { AiMemory } from './ai-memory.entity';
import { AiUsage } from './ai-usage.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Conversation } from './conversation.entity';
import { MemoryService } from './memory.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiConfig, AiMemory, AiUsage, Conversation]),
    PostModule,
    CategoryModule,
    TagModule,
    CommentModule,
    FriendLinkModule,
    GuestMessageModule,
    AnnouncementModule,
    ChangelogModule,
    SeoSettingModule,
    SiteConfigModule,
    IcpInfoModule,
    SettingModule,
    VisitorModule,
    DataTransferModule,
    OssModule,
  ],
  controllers: [AiController],
  providers: [AiService, MemoryService],
  exports: [AiService],
})
export class AiModule {}
