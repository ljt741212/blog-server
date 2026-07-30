import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PostModule } from "@/modules/post/post.module";
import { CategoryModule } from "@/modules/category/category.module";
import { TagModule } from "@/modules/tag/tag.module";
import { CommentModule } from "@/modules/comment/comment.module";
import { FriendLinkModule } from "@/modules/friend-link/friend-link.module";
import { GuestMessageModule } from "@/modules/guest-message/guest-message.module";
import { AnnouncementModule } from "@/modules/announcement/announcement.module";
import { ChangelogModule } from "@/modules/changelog/changelog.module";
import { SeoSettingModule } from "@/modules/seo-setting/seo-setting.module";
import { SiteConfigModule } from "@/modules/site-config/site-config.module";
import { IcpInfoModule } from "@/modules/icp-info/icp-info.module";
import { SettingModule } from "@/modules/setting/setting.module";
import { VisitorModule } from "@/modules/visitor/visitor.module";
import { DataTransferModule } from "@/modules/data-transfer/data-transfer.module";
import { OssModule } from "@/modules/oss/oss.module";

import { AiConfig } from "./ai-config.entity";
import { AiMemory } from "./ai-memory.entity";
import { AiUsage } from "./ai-usage.entity";
import { Conversation } from "./conversation.entity";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { MemoryService } from "./memory.service";

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