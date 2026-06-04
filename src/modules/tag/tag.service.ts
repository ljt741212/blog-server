import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin } from '@/common';

import {
  CreateTagDto,
  SaveTagDto,
  TagPageQueryDto,
  UpdateTagDto,
} from './tag.dto';
import { Tag, TagStatus } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async paginateForAdmin(query: TagPageQueryDto) {
    const qb = this.tagRepository.createQueryBuilder('tag');

    if (query.searchValue) {
      qb.andWhere('(tag.name LIKE :kw OR tag.description LIKE :kw)', {
        kw: `%${query.searchValue}%`,
      });
    }
    if (typeof query.status !== 'undefined') {
      qb.andWhere('tag.status = :status', { status: query.status });
    }

    qb.orderBy('tag.created_at', 'DESC');
    return paginateQueryBuilderForAdmin(qb, query);
  }

  async findAll() {
    return this.tagRepository.find({
      where: { status: TagStatus.ENABLED },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('标签不存在');
    return tag;
  }

  async create(dto: CreateTagDto) {
    const entity = this.tagRepository.create({
      name: dto.name,
      description: dto.description,
      status: dto.status ?? TagStatus.ENABLED,
    });

    try {
      return await this.tagRepository.save(entity);
    } catch (e: unknown) {
      const err = e as { code?: string; errno?: number };
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new BadRequestException('标签名称已存在');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateTagDto) {
    const tag = await this.findOne(id);

    if (typeof dto.name !== 'undefined') tag.name = dto.name;
    if (typeof dto.description !== 'undefined')
      tag.description = dto.description;
    if (typeof dto.status !== 'undefined') tag.status = dto.status;

    try {
      return await this.tagRepository.save(tag);
    } catch (e: unknown) {
      const err = e as { code?: string; errno?: number };
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new BadRequestException('标签名称已存在');
      }
      throw e;
    }
  }

  async save(dto: SaveTagDto) {
    if (dto.id) return this.update(dto.id, dto);
    return this.create(dto);
  }

  async remove(id: number) {
    const tag = await this.findOne(id);
    try {
      await this.tagRepository.remove(tag);
    } catch (e: unknown) {
      const err = e as { errno?: number };
      if (err?.errno === 1451) {
        throw new BadRequestException('该标签下有文章，无法删除');
      }
      throw e;
    }
    return true;
  }
}
