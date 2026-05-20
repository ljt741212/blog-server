import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { UserRole } from '@/modules/user/user.entity';

type RequestWithUser = Request & { user?: { id: number; role?: number } };

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const role = request.user?.role;

    if (role === UserRole.SUPER_ADMIN) return true;

    throw new ForbiddenException('仅超级管理员可操作');
  }
}
