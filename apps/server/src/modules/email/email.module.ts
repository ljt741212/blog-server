import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailCode } from './email-code.entity';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EmailCode])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
