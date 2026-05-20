import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FriendLinkController } from './friend-link.controller';
import { FriendLink } from './friend-link.entity';
import { FriendLinkService } from './friend-link.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendLink])],
  controllers: [FriendLinkController],
  providers: [FriendLinkService],
  exports: [FriendLinkService],
})
export class FriendLinkModule {}
