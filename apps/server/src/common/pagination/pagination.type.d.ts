export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
}
export interface PaginationResult<T> {
    list: T[];
    pagination: PaginationMeta;
}
export interface AdminPaginationMeta {
    current: number;
    pageSize: number;
    total: number;
}
export interface AdminPaginationResponse<T> {
    items: T[];
    meta: AdminPaginationMeta;
}
