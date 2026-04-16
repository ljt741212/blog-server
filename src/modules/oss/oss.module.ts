import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '@/common';
import { envString } from '@/global/env';

import { OssController } from './oss.controller';
import { OssService } from './oss.service';

@Module({
  imports: [
    JwtModule.register({
      secret: envString('JWT_SECRET', 'blog-secret'),
    }),
  ],
  controllers: [OssController],
  providers: [OssService, JwtAuthGuard],
  exports: [OssService],
})
export class OssModule {}
