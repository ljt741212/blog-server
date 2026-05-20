import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin } from '@/common';

import {
  AnnouncementPageQueryDto,
  SaveAnnouncementDto,
} from './announcement.dto';
import { Announcement, AnnouncementStatus } from './announcement.entity';

@Injectable()
export class AnnouncementService {
  constructor(
    @InjectRepository(Announcement)
    private readonly repo: Repository<Announcement>,
  ) {}

  async paginateForAdmin(query: AnnouncementPageQueryDto) {
    const qb = this.repo.createQueryBuilder('a');

    if (typeof query.status !== 'undefined') {
      qb.andWhere('a.status = :status', { status: query.status });
    }
    if (query.searchValue) {
      qb.andWhere('a.title LIKE :kw', { kw: `%${query.searchValue}%` });
    }

    qb.orderBy('a.isTop', 'DESC').addOrderBy('a.createdAt', 'DESC');
    return paginateQueryBuilderForAdmin(qb, query);
  }

  async findAll() {
    return this.repo.find({
      where: { status: AnnouncementStatus.PUBLISHED },
      order: { isTop: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('公告不存在');
    return item;
  }

  async create(dto: SaveAnnouncementDto) {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async update(id: number, dto: SaveAnnouncementDto) {
    const item = await this.findOne(id);
    const { title, content, status, isTop } = dto;
    if (typeof title !== 'undefined') item.title = title;
    if (typeof content !== 'undefined') item.content = content;
    if (typeof status !== 'undefined') item.status = status;
    if (typeof isTop !== 'undefined') item.isTop = isTop;
    return this.repo.save(item);
  }

  async save(dto: SaveAnnouncementDto) {
    if (dto.id) return this.update(dto.id, dto);
    return this.create(dto);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.repo.remove(item);
    return true;
  }
}
