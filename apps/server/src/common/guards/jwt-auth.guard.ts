import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  sub?: number;
  id?: number;
  role?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('未提供登录凭证');
    }

    const token = authorization.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      throw new UnauthorizedException('未提供登录凭证');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload?.sub ?? payload?.id;
      if (userId == null) {
        throw new UnauthorizedException('登录信息无效');
      }
      (request as Request & { user: { id: number; role?: number } }).user = {
        id: Number(userId),
        role: typeof payload?.role === 'number' ? payload.role : undefined,
      };
      return true;
    } catch {
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
  }
}
