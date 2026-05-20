import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GuestMessageController } from './guest-message.controller';
import { GuestMessage } from './guest-message.entity';
import { GuestMessageService } from './guest-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([GuestMessage])],
  controllers: [GuestMessageController],
  providers: [GuestMessageService],
  exports: [GuestMessageService],
})
export class GuestMessageModule {}
