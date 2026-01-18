import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";
import type { IRepository } from "@shared-domain/repository.interface";

import type { UserEntity } from "@users-domain/entities/user.entity";

export type UserOrderBy = 'createdAt' | 'name';

export interface IUserRepository extends IRepository<
    string,
    UserEntity,
    PaginationParams<UserOrderBy>,
    PaginatedResult<UserEntity>
> {
    existsByEmail(email: string): Promise<boolean>;
    existsByDni(dni: string): Promise<boolean>;
    // index(params: PaginationParams<UserOrderBy>): Promise<PaginatedResult<UserEntity>>;
    findById(id: string): Promise<UserEntity | null>;
    save(user: UserEntity): Promise<UserEntity>;
    update(user: UserEntity): Promise<UserEntity>;
}
