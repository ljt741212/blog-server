import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IcpInfoController } from './icp-info.controller';
import { IcpInfo } from './icp-info.entity';
import { IcpInfoService } from './icp-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([IcpInfo])],
  controllers: [IcpInfoController],
  providers: [IcpInfoService],
  exports: [IcpInfoService],
})
export class IcpInfoModule {}
