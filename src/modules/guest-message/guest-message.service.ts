import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin, PaginationQueryDto } from '@/common';

import {
  CreateGuestMessageDto,
  GuestMessagePageQueryDto,
  GuestMessageListQueryDto,
} from './guest-message.dto';
import { GuestMessage, GuestMessageStatus } from './guest-message.entity';

@Injectable()
export class GuestMessageService {
  constructor(
    @InjectRepository(GuestMessage)
    private readonly guestMessageRepository: Repository<GuestMessage>,
  ) {}

  async create(dto: CreateGuestMessageDto): Promise<GuestMessage> {
    const { content, nickname, email, userId, visitorId } = dto;

    if (!userId && !visitorId) {
      throw new BadRequestException('请提供 userId 或 visitorId');
    }

    const message = this.guestMessageRepository.create({
      content,
      nickname: nickname ?? undefined,
      email: email ?? undefined,
      userId: userId ?? undefined,
      visitorId: visitorId ?? undefined,
      status: GuestMessageStatus.PENDING,
    });
    const saved = await this.guestMessageRepository.save(message);
    return this.guestMessageRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'visitor'],
    }) as Promise<GuestMessage>;
  }

  async updateStatus(id: number, status: GuestMessageStatus): Promise<boolean> {
    const message = await this.guestMessageRepository.findOne({
      where: { id },
    });
    if (!message) throw new NotFoundException('留言不存在');
    message.status = status;
    await this.guestMessageRepository.save(message);
    return true;
  }

  async paginate(query: GuestMessagePageQueryDto) {
    const normalized: PaginationQueryDto & {
      status?: GuestMessageStatus;
      keyword?: string;
    } = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      status: query.status,
      keyword: query.keyword,
    };

    const qb = this.guestMessageRepository
      .createQueryBuilder('guest_message')
      .leftJoinAndSelect('guest_message.user', 'user')
      .leftJoinAndSelect('guest_message.visitor', 'visitor');

    if (normalized.status !== undefined) {
      qb.andWhere('guest_message.status = :status', {
        status: normalized.status,
      });
    }
    if (normalized.keyword) {
      qb.andWhere(
        '(guest_message.content LIKE :kw OR guest_message.nickname LIKE :kw OR guest_message.email LIKE :kw)',
        { kw: `%${normalized.keyword}%` },
      );
    }

    qb.orderBy('guest_message.createdAt', 'DESC');
    const page = await paginateQueryBuilderForAdmin(qb, normalized);
    return {
      ...page,
      items: page.items.map((m) => this.buildGuestMessageItem(m)),
    };
  }

  async paginateForAdmin(query: {
    current?: number;
    pageSize?: number;
    status?: GuestMessageStatus;
    searchValue?: string;
  }) {
    const normalized: GuestMessagePageQueryDto = {
      page: query.current ?? 1,
      limit: query.pageSize ?? 10,
      status: query.status,
      keyword: query.searchValue,
    };
    return this.paginate(normalized);
  }

  async findList(query: GuestMessageListQueryDto) {
    const { approvedOnly = true } = query;

    const qb = this.guestMessageRepository
      .createQueryBuilder('guest_message')
      .leftJoinAndSelect('guest_message.user', 'user')
      .leftJoinAndSelect('guest_message.visitor', 'visitor');

    if (approvedOnly) {
      qb.andWhere('guest_message.status = :status', {
        status: GuestMessageStatus.APPROVED,
      });
    }

    qb.orderBy('guest_message.createdAt', 'DESC');

    const list = await qb.getMany();
    return list.map((m) => this.buildGuestMessageForPublic(m));
  }

  async remove(id: number): Promise<boolean> {
    const message = await this.guestMessageRepository.findOne({
      where: { id },
    });
    if (!message) throw new NotFoundException('留言不存在');
    await this.guestMessageRepository.remove(message);
    return true;
  }

  private buildGuestMessageItem(message: GuestMessage) {
    return {
      id: message.id,
      content: message.content,
      status: message.status,
      nickname: message.nickname,
      email: message.email,
      user: message.user
        ? { id: message.user.id, username: message.user.username }
        : null,
      visitor: message.visitor
        ? { id: message.visitor.id, ip: message.visitor.ip }
        : null,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  private buildGuestMessageForPublic(message: GuestMessage) {
    return {
      id: message.id,
      content: message.content,
      nickname: message.nickname,
      user: message.user
        ? {
            id: message.user.id,
            username: message.user.username,
            avatar: message.user.avatar,
          }
        : null,
      visitor: message.visitor
        ? { id: message.visitor.id, ip: message.visitor.ip }
        : null,
      createdAt: message.createdAt,
    };
  }
}
