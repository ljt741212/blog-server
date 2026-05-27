import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthUtil {
  constructor(private readonly jwtService: JwtService) {}

  extractUserId(authorization?: string): number {
    if (!authorization) throw new UnauthorizedException('未提供登录凭证');
    const token = authorization.replace(/^Bearer\s+/i, '').trim();
    if (!token) throw new UnauthorizedException('未提供登录凭证');

    try {
      const payload: { sub?: number; id?: number } =
        this.jwtService.verify(token);
      const userId = payload?.sub ?? payload?.id;
      if (userId == null) throw new UnauthorizedException('登录信息无效');
      return Number(userId);
    } catch {
      throw new UnauthorizedException('登录已失效，请重新登录');
    }
  }
}
