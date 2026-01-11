export interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: 'createdAt' | 'name';
    direction?: 'asc' | 'desc';
    search?: string;
}
