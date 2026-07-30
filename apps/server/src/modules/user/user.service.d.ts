import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { EmailService } from "../../../../../src/modules/email/email.service";
import { AuthUtil } from "../../../../../src/shared/auth/auth.util";
import { ChangePasswordDto, CreateUserDto, EmailLoginDto, SendEmailCodeDto, UpdateUserDto, UserLoginDto, UserPageQueryDto } from './user.dto';
import { User, UserRole } from './user.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly jwtService;
    private readonly authUtil;
    private readonly emailService;
    constructor(userRepository: Repository<User>, jwtService: JwtService, authUtil: AuthUtil, emailService: EmailService);
    paginateForAdmin(query: UserPageQueryDto): Promise<{
        items: {
            id: string;
            username: string;
            nickname: string;
            email: string;
            phone: string;
            wechat: string;
            avatar: string;
            role: UserRole;
            bio: string;
            github: string;
            createdAt: Date;
        }[];
        meta: import("@/common").AdminPaginationMeta;
    }>;
    findCurrentUser(authorization?: string): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    findSuperAdmin(): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    findOne(id: number): Promise<User>;
    findDetailForAdmin(id: number): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    remove(id: number): Promise<boolean>;
    login(dto: UserLoginDto): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            nickname: string;
            email: string;
            phone: string;
            wechat: string;
            avatar: string;
            role: UserRole;
            bio: string;
            github: string;
            createdAt: Date;
        };
    }>;
    sendEmailCode(dto: SendEmailCodeDto): Promise<{
        message: string;
    }>;
    emailLogin(dto: EmailLoginDto): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            nickname: string;
            email: string;
            phone: string;
            wechat: string;
            avatar: string;
            role: UserRole;
            bio: string;
            github: string;
            createdAt: Date;
        };
    }>;
    changePassword(authorization: string | undefined, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
