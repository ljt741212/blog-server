"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateRepository = exports.paginateQueryBuilderForAdmin = exports.paginateQueryBuilder = exports.toAdminPaginationResponse = exports.toPaginationResult = exports.buildPaginationOptions = void 0;
const nestjs_typeorm_paginate_1 = require("nestjs-typeorm-paginate");
function resolvePagination(query) {
    return {
        page: query.current ?? query.page ?? 1,
        limit: query.pageSize ?? query.limit ?? 10,
        paginationType: nestjs_typeorm_paginate_1.PaginationTypeEnum.TAKE_AND_SKIP,
    };
}
const buildPaginationOptions = (query) => ({
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    paginationType: nestjs_typeorm_paginate_1.PaginationTypeEnum.TAKE_AND_SKIP,
});
exports.buildPaginationOptions = buildPaginationOptions;
const toPaginationResult = (pagination) => ({
    list: pagination.items,
    pagination: {
        total: pagination.meta.totalItems ?? 0,
        page: pagination.meta.currentPage ?? 1,
        pageSize: pagination.meta.itemsPerPage ?? 0,
    },
});
exports.toPaginationResult = toPaginationResult;
const toAdminPaginationResponse = (pagination) => ({
    items: pagination.items,
    meta: {
        total: pagination.meta.totalItems ?? 0,
        current: pagination.meta.currentPage ?? 1,
        pageSize: pagination.meta.itemsPerPage ?? 0,
    },
});
exports.toAdminPaginationResponse = toAdminPaginationResponse;
const paginateQueryBuilder = async (qb, query) => {
    const pagination = await (0, nestjs_typeorm_paginate_1.paginate)(qb, (0, exports.buildPaginationOptions)(query));
    return (0, exports.toPaginationResult)(pagination);
};
exports.paginateQueryBuilder = paginateQueryBuilder;
const paginateQueryBuilderForAdmin = async (qb, query) => {
    const pagination = await (0, nestjs_typeorm_paginate_1.paginate)(qb, resolvePagination(query));
    return (0, exports.toAdminPaginationResponse)(pagination);
};
exports.paginateQueryBuilderForAdmin = paginateQueryBuilderForAdmin;
const paginateRepository = async (repository, query, alias, qbModifier) => {
    const qb = repository.createQueryBuilder(alias || repository.metadata.name);
    qbModifier?.(qb);
    return (0, exports.paginateQueryBuilder)(qb, query);
};
exports.paginateRepository = paginateRepository;
//# sourceMappingURL=pagination.util.js.map