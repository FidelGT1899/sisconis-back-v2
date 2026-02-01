import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";
import type { IRepository } from "@shared-domain/repository.interface";

import type { RoleEntity } from "@users-domain/entities/role.entity";

export type RoleOrderBy = 'createdAt' | 'name';

export interface IRoleRepository extends IRepository<
    string,
    RoleEntity,
    PaginationParams<RoleOrderBy>,
    PaginatedResult<RoleEntity>
> {
    existsByName(name: string): Promise<boolean>;
    existsByLevel(level: number): Promise<boolean>;
    findById(id: string): Promise<RoleEntity | null>;
    save(role: RoleEntity): Promise<RoleEntity>;
    update(role: RoleEntity): Promise<RoleEntity>;
}
