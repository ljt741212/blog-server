import {
  IPaginationOptions,
  Pagination,
  PaginationTypeEnum,
  paginate,
} from 'nestjs-typeorm-paginate';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';

import { PaginationQueryDto } from './pagination.dto';
import { AdminPaginationResponse, PaginationResult } from './pagination.type';

type PaginationInput = {
  current?: number;
  pageSize?: number;
  page?: number;
  limit?: number;
};

function resolvePagination(query: PaginationInput): IPaginationOptions {
  return {
    page: query.current ?? query.page ?? 1,
    limit: query.pageSize ?? query.limit ?? 10,
    paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
  };
}

export const buildPaginationOptions = (
  query: PaginationQueryDto,
): IPaginationOptions => ({
  page: query.page ?? 1,
  limit: query.limit ?? 10,
  paginationType: PaginationTypeEnum.TAKE_AND_SKIP,
});

export const toPaginationResult = <T>(
  pagination: Pagination<T>,
): PaginationResult<T> => ({
  list: pagination.items,
  pagination: {
    total: pagination.meta.totalItems ?? 0,
    page: pagination.meta.currentPage ?? 1,
    pageSize: pagination.meta.itemsPerPage ?? 0,
  },
});

export const toAdminPaginationResponse = <T>(
  pagination: Pagination<T>,
): AdminPaginationResponse<T> => ({
  items: pagination.items,
  meta: {
    total: pagination.meta.totalItems ?? 0,
    current: pagination.meta.currentPage ?? 1,
    pageSize: pagination.meta.itemsPerPage ?? 0,
  },
});

export const paginateQueryBuilder = async <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginationQueryDto,
): Promise<PaginationResult<T>> => {
  const pagination = await paginate<T>(qb, buildPaginationOptions(query));
  return toPaginationResult(pagination);
};

export const paginateQueryBuilderForAdmin = async <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  query: PaginationInput,
): Promise<AdminPaginationResponse<T>> => {
  const pagination = await paginate<T>(qb, resolvePagination(query));
  return toAdminPaginationResponse(pagination);
};

export const paginateRepository = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  query: PaginationQueryDto,
  alias?: string,
  qbModifier?: (qb: SelectQueryBuilder<T>) => void,
): Promise<PaginationResult<T>> => {
  const qb = repository.createQueryBuilder(alias || repository.metadata.name);
  qbModifier?.(qb);
  return paginateQueryBuilder(qb, query);
};
