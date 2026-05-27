import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin } from '@/common';

import {
  ChangelogPageQueryDto,
  SaveChangelogDto,
  UpdateChangelogStatusDto,
} from './changelog.dto';
import { Changelog } from './changelog.entity';

@Injectable()
export class ChangelogService {
  constructor(
    @InjectRepository(Changelog)
    private readonly changelogRepository: Repository<Changelog>,
  ) {}

  async paginateForAdmin(query: ChangelogPageQueryDto) {
    const qb = this.changelogRepository.createQueryBuilder('changelog');

    if (query.searchValue) {
      qb.andWhere(
        '(changelog.version LIKE :kw OR changelog.title LIKE :kw OR changelog.content LIKE :kw)',
        { kw: `%${query.searchValue}%` },
      );
    }

    if (typeof query.type !== 'undefined') {
      qb.andWhere('changelog.type = :type', { type: query.type });
    }

    if (typeof query.isPublished !== 'undefined') {
      qb.andWhere('changelog.isPublished = :isPublished', {
        isPublished: query.isPublished,
      });
    }

    qb.orderBy('changelog.releaseDate', 'DESC').addOrderBy(
      'changelog.createdAt',
      'DESC',
    );

    return paginateQueryBuilderForAdmin(qb, query);
  }

  async findAll() {
    return this.changelogRepository.find({
      where: { isPublished: true },
      order: {
        releaseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const item = await this.changelogRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException('更新日志不存在');
    return item;
  }

  async findPublicOne(id: number) {
    const item = await this.changelogRepository.findOne({
      where: { id, isPublished: true },
    });
    if (!item) throw new NotFoundException('更新日志不存在');
    return item;
  }

  async create(dto: SaveChangelogDto) {
    const { version, title, content, type, isPublished, releaseDate } = dto;

    const entity = this.changelogRepository.create({
      version,
      title,
      content,
      type,
      isPublished: typeof isPublished === 'boolean' ? isPublished : false,
      releaseDate: new Date(releaseDate),
    });

    return this.changelogRepository.save(entity);
  }

  async update(id: number, dto: SaveChangelogDto) {
    const changelog = await this.findOne(id);

    const { version, title, content, type, isPublished, releaseDate } = dto;

    if (typeof version !== 'undefined') changelog.version = version;
    if (typeof title !== 'undefined') changelog.title = title;
    if (typeof content !== 'undefined') changelog.content = content;
    if (typeof type !== 'undefined') changelog.type = type;
    if (typeof isPublished !== 'undefined') changelog.isPublished = isPublished;
    if (typeof releaseDate !== 'undefined') {
      changelog.releaseDate = new Date(releaseDate);
    }

    return this.changelogRepository.save(changelog);
  }

  async updateStatus(id: number, dto: UpdateChangelogStatusDto) {
    const changelog = await this.findOne(id);
    changelog.isPublished = dto.isPublished;
    return this.changelogRepository.save(changelog);
  }

  async save(dto: SaveChangelogDto) {
    if (dto.id) {
      return this.update(dto.id, dto);
    }
    return this.create(dto);
  }

  async remove(id: number) {
    const changelog = await this.findOne(id);
    return this.changelogRepository.remove(changelog);
  }
}
