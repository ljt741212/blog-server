import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { envString } from '@/global/env';

import { DataTransferController } from './data-transfer.controller';
import { DataTransferService } from './data-transfer.service';

@Module({
  imports: [
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [DataTransferController],
  providers: [DataTransferService],
})
export class DataTransferModule {}

