import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { IcpInfoController } from './icp-info.controller';
import { IcpInfo } from './icp-info.entity';
import { IcpInfoService } from './icp-info.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([IcpInfo]),
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [IcpInfoController],
  providers: [IcpInfoService, JwtAuthGuard],
  exports: [IcpInfoService],
})
export class IcpInfoModule {}
