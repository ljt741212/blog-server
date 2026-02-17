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
import { User } from './user.entity';

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
      items: pageResult.items.map((u: User) => ({
        id: String(u.id),
        name: u.username,
        nickname: u.nickname,
        email: u.email,
        phone: u.phone,
        wechat: u.wechat,
        avatar: u.avatar,
        role: u.role,
        status: '1',
        description: u.bio,
        github: u.githubAccount,
        createdAt: u.createdAt,
      })),
    };
  }

  async findCurrentUser(authorization?: string) {
    const userId = this.extractUserIdFromAuthorization(authorization);
    return this.findDetailForAdmin(userId);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    return user;
  }

  async findDetailForAdmin(id: number) {
    const u = await this.findOne(id);
    return {
      id: String(u.id),
      name: u.username,
      nickname: u.nickname,
      email: u.email,
      phone: u.phone,
      wechat: u.wechat,
      avatar: u.avatar,
      role: u.role,
      status: '1',
      description: u.bio,
      github: u.githubAccount,
      createdAt: u.createdAt,
    };
  }

  async create(dto: CreateUserDto) {
    const exists = await this.userRepository.findOne({
      where: [{ username: dto.username }, { email: dto.email }],
    });
    if (exists) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    const {
      username,
      nickname,
      password: dtoPassword,
      email,
      phone,
      wechat,
      avatar,
      bio,
      githubAccount,
      gender,
      role,
    } = dto;

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

    const {
      username,
      nickname,
      email,
      phone,
      wechat,
      password,
      avatar,
      bio,
      githubAccount,
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
      user: {
        id: String(user.id),
        name: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        wechat: user.wechat,
        avatar: user.avatar,
        role: user.role,
        status: '1',
        description: user.bio,
      },
    };
  }

  async changePassword(authorization: string | undefined, dto: ChangePasswordDto) {
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
