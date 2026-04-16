import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { FriendLinkController } from './friend-link.controller';
import { FriendLink } from './friend-link.entity';
import { FriendLinkService } from './friend-link.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendLink]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [FriendLinkController],
  providers: [FriendLinkService, JwtAuthGuard],
  exports: [FriendLinkService],
})
export class FriendLinkModule {}
