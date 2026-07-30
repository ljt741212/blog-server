import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '@/common/guards/super-admin.guard';
import { envString } from '@/global/env';

import { AuthUtil } from './auth.util';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: envString('JWT_SECRET'),
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [JwtAuthGuard, SuperAdminGuard, AuthUtil],
  exports: [JwtModule, JwtAuthGuard, SuperAdminGuard, AuthUtil],
})
export class AuthModule {}
