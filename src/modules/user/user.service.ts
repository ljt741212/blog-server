import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin } from '@/common';

import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UserListQueryDto,
  UserLoginDto,
  UserPageQueryDto,
} from './user.dto';
import { User, UserRole } from './user.entity';

/** 用户对外 JSON：统一小驼峰 */
function toUserResponse(u: User) {
  return {
    id: String(u.id),
    username: u.username,
    nickname: u.nickname,
    email: u.email,
    phone: u.phone,
    wechat: u.wechat,
    avatar: u.avatar,
    role: u.role,
    status: 1,
    bio: u.bio,
    github: u.githubAccount,
    createdAt: u.createdAt,
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserIdFromAuthorization(authorization?: string): number {
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

  async paginateForAdmin(query: UserPageQueryDto) {
    const normalized: UserListQueryDto = {
      page: query.current ?? 1,
      limit: query.pageSize ?? 10,
      searchValue: query.searchValue,
    };

    const qb = this.userRepository.createQueryBuilder('user');

    if (normalized.searchValue) {
      qb.andWhere('(user.username LIKE :kw OR user.email LIKE :kw)', {
        kw: `%${normalized.searchValue}%`,
      });
    }

    qb.orderBy('user.created_at', 'DESC');
    const pageResult = await paginateQueryBuilderForAdmin(qb, normalized);

    return {
      ...pageResult,
      items: pageResult.items.map((u: User) => toUserResponse(u)),
    };
  }

  async findCurrentUser(authorization?: string) {
    const userId = this.extractUserIdFromAuthorization(authorization);
    return this.findDetailForAdmin(userId);
  }

  async findSuperAdmin() {
    const user = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN },
    });
    if (!user) throw new NotFoundException('超级管理员不存在');
    return toUserResponse(user);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async findDetailForAdmin(id: number) {
    const u = await this.findOne(id);
    return toUserResponse(u);
  }

  async create(dto: CreateUserDto) {
    const username = dto.Name ?? dto.username;
    const email = dto.Email ?? dto.email;
    if (!username || !email) {
      throw new BadRequestException('用户名和邮箱必填');
    }
    const exists = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (exists) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    const nickname = dto.NikName ?? dto.nickname;
    const phone = dto.Phone ?? dto.phone;
    const wechat = dto.WeChat ?? dto.wechat;
    const avatar = dto.Avatar ?? dto.avatar;
    const bio = dto.Description ?? dto.bio;
    const githubAccount = dto.GitHub ?? dto.githubAccount ?? dto.github;
    const { password: dtoPassword, gender, role } = dto;

    const rawPassword = dtoPassword ?? '123456';
    const password = await bcrypt.hash(rawPassword, 10);

    const entity = this.userRepository.create({
      username,
      nickname,
      password,
      email,
      phone,
      wechat,
      avatar,
      bio,
      githubAccount,
      gender,
      role,
    });
    const saved = await this.userRepository.save(entity);
    return this.findDetailForAdmin(saved.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    const username = dto.Name ?? dto.username;
    const nickname = dto.NikName ?? dto.nickname;
    const email = dto.Email ?? dto.email;
    const phone = dto.Phone ?? dto.phone;
    const wechat = dto.WeChat ?? dto.wechat;
    const avatar = dto.Avatar ?? dto.avatar;
    const bio = dto.Description ?? dto.bio;
    const githubAccount = dto.GitHub ?? dto.githubAccount ?? dto.github;
    const password = dto.Password ?? dto.password;
    const gender = dto.Gender ?? dto.gender;
    const role = dto.Role ?? dto.role;

    if (username && username !== user.username) {
      const exists = await this.userRepository.findOne({ where: { username } });
      if (exists) throw new BadRequestException('用户名已存在');
      user.username = username;
    }
    if (email && email !== user.email) {
      const exists = await this.userRepository.findOne({ where: { email } });
      if (exists) throw new BadRequestException('邮箱已存在');
      user.email = email;
    }

    if (typeof password !== 'undefined') {
      user.password = await bcrypt.hash(password, 10);
    }
    if (typeof nickname !== 'undefined') user.nickname = nickname;
    if (typeof phone !== 'undefined') user.phone = phone;
    if (typeof wechat !== 'undefined') user.wechat = wechat;
    if (typeof avatar !== 'undefined') user.avatar = avatar;
    if (typeof bio !== 'undefined') user.bio = bio;
    if (typeof githubAccount !== 'undefined')
      user.githubAccount = githubAccount;
    if (typeof gender !== 'undefined') user.gender = gender;
    if (typeof role !== 'undefined') user.role = role;

    await this.userRepository.save(user);
    return this.findDetailForAdmin(user.id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return true;
  }

  async login(dto: UserLoginDto) {
    const user = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    let isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      if (user.password === dto.password) {
        user.password = await bcrypt.hash(dto.password, 10);
        await this.userRepository.save(user);
        isValid = true;
      }
    }

    if (!isValid) throw new UnauthorizedException('用户名或密码错误');

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: toUserResponse(user),
    };
  }

  async changePassword(
    authorization: string | undefined,
    dto: ChangePasswordDto,
  ) {
    const userId = this.extractUserIdFromAuthorization(authorization);
    const user = await this.findOne(userId);

    const isValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('原密码错误');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);
    return { message: '密码修改成功' };
  }
}
