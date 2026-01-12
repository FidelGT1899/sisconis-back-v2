export interface PaginationParams<T = string> {
    page?: number;
    limit?: number;
    orderBy?: T;
    direction?: 'asc' | 'desc';
    search?: string;
}
