import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from './pagination.dto';
import { AdminPaginationResponse, PaginationResult } from './pagination.type';
type PaginationInput = {
    current?: number;
    pageSize?: number;
    page?: number;
    limit?: number;
};
export declare const buildPaginationOptions: (query: PaginationQueryDto) => IPaginationOptions;
export declare const toPaginationResult: <T>(pagination: Pagination<T>) => PaginationResult<T>;
export declare const toAdminPaginationResponse: <T>(pagination: Pagination<T>) => AdminPaginationResponse<T>;
export declare const paginateQueryBuilder: <T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, query: PaginationQueryDto) => Promise<PaginationResult<T>>;
export declare const paginateQueryBuilderForAdmin: <T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, query: PaginationInput) => Promise<AdminPaginationResponse<T>>;
export declare const paginateRepository: <T extends ObjectLiteral>(repository: Repository<T>, query: PaginationQueryDto, alias?: string, qbModifier?: (qb: SelectQueryBuilder<T>) => void) => Promise<PaginationResult<T>>;
export {};
