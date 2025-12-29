export interface PaginationUsersDto {
    page: number;
    limit: number;
    orderBy: 'createdAt' | 'name';
    direction: 'asc' | 'desc';
    search?: string;
}
