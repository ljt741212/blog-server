import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Visitor } from '@/modules/visitor/visitor.entity';

import { GuestMessageController } from './guest-message.controller';
import { GuestMessage } from './guest-message.entity';
import { GuestMessageService } from './guest-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([GuestMessage, Visitor])],
  controllers: [GuestMessageController],
  providers: [GuestMessageService],
  exports: [GuestMessageService],
})
export class GuestMessageModule {}
