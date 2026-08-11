import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Announcement } from '@/modules/announcement/announcement.entity';
import { Category } from '@/modules/category/category.entity';
import { Changelog } from '@/modules/changelog/changelog.entity';
import { Comment } from '@/modules/comment/comment.entity';
import { FriendLink } from '@/modules/friend-link/friend-link.entity';
import { GuestMessage } from '@/modules/guest-message/guest-message.entity';
import { IcpInfo } from '@/modules/icp-info/icp-info.entity';
import { Post } from '@/modules/post/post.entity';
import { SeoSetting } from '@/modules/seo-setting/seo-setting.entity';
import { SiteConfig } from '@/modules/site-config/site-config.entity';
import { Tag } from '@/modules/tag/tag.entity';
import { User } from '@/modules/user/user.entity';
import { VisitorLog } from '@/modules/visitor/visitor-log.entity';
import { Visitor } from '@/modules/visitor/visitor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Announcement,
      Category,
      Changelog,
      Comment,
      FriendLink,
      GuestMessage,
      IcpInfo,
      Post,
      SeoSetting,
      SiteConfig,
      Tag,
      User,
      Visitor,
      VisitorLog,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EntitiesModule {}
