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
import { AuthUtil } from '@/shared/auth/auth.util';

import {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UserLoginDto,
  UserPageQueryDto,
} from './user.dto';
import { User, UserRole } from './user.entity';

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
    private readonly authUtil: AuthUtil,
  ) {}

  async paginateForAdmin(query: UserPageQueryDto) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (query.searchValue) {
      qb.andWhere('(user.username LIKE :kw OR user.email LIKE :kw)', {
        kw: `%${query.searchValue}%`,
      });
    }

    qb.orderBy('user.created_at', 'DESC');
    const pageResult = await paginateQueryBuilderForAdmin(qb, query);

    return {
      ...pageResult,
      items: pageResult.items.map((u: User) => toUserResponse(u)),
    };
  }

  async findCurrentUser(authorization?: string) {
    const userId = this.authUtil.extractUserId(authorization);
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
    const {
      username,
      email,
      password,
      nickname,
      phone,
      wechat,
      avatar,
      bio,
      github,
      gender,
      role,
    } = dto;

    if (!username || !email) {
      throw new BadRequestException('用户名和邮箱必填');
    }
    if (!password) {
      throw new BadRequestException('密码不能为空');
    }

    const exists = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (exists) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const entity = this.userRepository.create({
      username,
      nickname,
      password: hashedPassword,
      email,
      phone,
      wechat,
      avatar,
      bio,
      githubAccount: github,
      gender,
      role,
    });
    const saved = await this.userRepository.save(entity);
    return this.findDetailForAdmin(saved.id);
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);

    const {
      username,
      nickname,
      email,
      phone,
      wechat,
      avatar,
      bio,
      github,
      password,
      gender,
      role,
    } = dto;

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

    if (typeof password === 'string' && password.length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (typeof nickname !== 'undefined') user.nickname = nickname;
    if (typeof phone !== 'undefined') user.phone = phone;
    if (typeof wechat !== 'undefined') user.wechat = wechat;
    if (typeof avatar !== 'undefined') user.avatar = avatar;
    if (typeof bio !== 'undefined') user.bio = bio;
    if (typeof github !== 'undefined') user.githubAccount = github;
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

    const isValid = await bcrypt.compare(dto.password, user.password);
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
    const userId = this.authUtil.extractUserId(authorization);
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
