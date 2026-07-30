import { ChangePasswordDto, CreateUserDto, EmailLoginDto, IdParamDto, SendEmailCodeDto, UpdateUserDto, UserPageQueryDto, UserLoginDto } from './user.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
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
            role: import("./user.entity").UserRole;
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
            role: import("./user.entity").UserRole;
            bio: string;
            github: string;
            createdAt: Date;
        };
    }>;
    currentUser(authorization?: string): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: import("./user.entity").UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    getSuperAdmin(): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: import("./user.entity").UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    changePassword(authorization: string | undefined, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    paginate(query: UserPageQueryDto): Promise<{
        items: {
            id: string;
            username: string;
            nickname: string;
            email: string;
            phone: string;
            wechat: string;
            avatar: string;
            role: import("./user.entity").UserRole;
            bio: string;
            github: string;
            createdAt: Date;
        }[];
        meta: import("@/common").AdminPaginationMeta;
    }>;
    findOne(params: IdParamDto): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: import("./user.entity").UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    save(dto: CreateUserDto & {
        id?: number;
    }): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: import("./user.entity").UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    update(params: IdParamDto, dto: UpdateUserDto): Promise<{
        id: string;
        username: string;
        nickname: string;
        email: string;
        phone: string;
        wechat: string;
        avatar: string;
        role: import("./user.entity").UserRole;
        bio: string;
        github: string;
        createdAt: Date;
    }>;
    remove(params: IdParamDto): Promise<boolean>;
    removeByPost(params: IdParamDto): Promise<boolean>;
}
