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
  TagListQueryDto,
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

  async paginate(query: TagListQueryDto) {
    const qb = this.tagRepository.createQueryBuilder('tag');

    if (query.keyword) {
      qb.andWhere('(tag.name LIKE :kw OR tag.description LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    if (typeof query.status !== 'undefined') {
      qb.andWhere('tag.status = :status', { status: query.status });
    }

    qb.orderBy('tag.created_at', 'DESC');
    return paginateQueryBuilderForAdmin(qb, query);
  }

  async paginateForAdmin(query: TagPageQueryDto) {
    const normalized: TagListQueryDto = {
      page: query.current ?? 1,
      limit: query.pageSize ?? 10,
      keyword: query.searchValue,
      status: query.status,
    };
    return this.paginate(normalized);
  }

  async findAll() {
    return this.tagRepository.find({ order: { id: 'DESC' } });
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

  async remove(id: number) {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
    return true;
  }
}
