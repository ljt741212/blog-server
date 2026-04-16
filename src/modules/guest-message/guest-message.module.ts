import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { GuestMessageController } from './guest-message.controller';
import { GuestMessage } from './guest-message.entity';
import { GuestMessageService } from './guest-message.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuestMessage]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [GuestMessageController],
  providers: [GuestMessageService, JwtAuthGuard],
  exports: [GuestMessageService],
})
export class GuestMessageModule {}
