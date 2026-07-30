import { JwtService } from '@nestjs/jwt';
export declare class AuthUtil {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    extractUserId(authorization?: string): number;
}
