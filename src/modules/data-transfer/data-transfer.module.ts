import { Module } from '@nestjs/common';

import { OssModule } from '@/modules/oss/oss.module';
import { EntitiesModule } from '@/shared/database/entities.module';

import { DataTransferController } from './data-transfer.controller';
import { DataTransferService } from './data-transfer.service';
import { WordPressImportService } from './wordpress-import.service';

@Module({
  imports: [EntitiesModule, OssModule],
  controllers: [DataTransferController],
  providers: [DataTransferService, WordPressImportService],
})
export class DataTransferModule {}
