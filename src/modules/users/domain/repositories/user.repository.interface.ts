import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";

import type { PaginationParams } from "@shared-kernel/utils/pagination-params";

import type { UserEntity } from "@users-domain/entities/user.entity";

export type UserOrderBy = 'createdAt' | 'name';

export interface IUserRepository {
    existsByEmail(email: string): Promise<boolean>;
    index(params: PaginationParams<UserOrderBy>): Promise<PaginatedResult<UserEntity>>;
    find(id: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
    delete(id: string): Promise<void>;
}
