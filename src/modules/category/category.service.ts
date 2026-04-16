import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { paginateQueryBuilderForAdmin, PaginationQueryDto } from '@/common';

import {
  CategoryListQueryDto,
  CategoryPageQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './category.dto';
import { Category, CategoryStatus } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async paginate(query: CategoryListQueryDto) {
    const qb = this.categoryRepository.createQueryBuilder('category');

    if (query.keyword) {
      qb.andWhere('(category.name LIKE :kw OR category.description LIKE :kw)', {
        kw: `%${query.keyword}%`,
      });
    }
    if (typeof query.status !== 'undefined') {
      qb.andWhere('category.status = :status', { status: query.status });
    }

    qb.orderBy('category.created_at', 'DESC');
    return paginateQueryBuilderForAdmin(qb, query as PaginationQueryDto);
  }

  async paginateForAdmin(query: CategoryPageQueryDto) {
    const normalized: CategoryListQueryDto = {
      page: query.current ?? 1,
      limit: query.pageSize ?? 10,
      keyword: query.searchValue,
      status: query.status,
    };
    return this.paginate(normalized);
  }

  async findAll() {
    return this.categoryRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) throw new NotFoundException('分类不存在');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const entity = this.categoryRepository.create({
      ...dto,
      status: dto.status ?? CategoryStatus.ENABLED,
    });

    try {
      return await this.categoryRepository.save(entity);
    } catch (e: unknown) {
      const err = e as { code?: string; errno?: number };
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new BadRequestException('分类名称已存在');
      }
      throw e;
    }
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (typeof dto.name !== 'undefined') category.name = dto.name;
    if (typeof dto.description !== 'undefined')
      category.description = dto.description;
    if (typeof dto.status !== 'undefined') category.status = dto.status;

    try {
      return await this.categoryRepository.save(category);
    } catch (e: unknown) {
      const err = e as { code?: string; errno?: number };
      if (err?.code === 'ER_DUP_ENTRY' || err?.errno === 1062) {
        throw new BadRequestException('分类名称已存在');
      }
      throw e;
    }
  }

  async updateStatus(id: number, status: CategoryStatus) {
    const category = await this.findOne(id);
    category.status = status;
    return this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return true;
  }
}
