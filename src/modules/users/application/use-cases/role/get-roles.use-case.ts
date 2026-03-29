import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";

import type { IRoleRepository, RoleOrderBy } from "@users-domain/repositories/role.repository.interface";
import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";

export interface PaginatedRoles {
    items: ReadRoleDto[];
    total: number;
    page: number;
    limit: number;
}

export type GetRolesResult = Result<PaginatedRoles, AppError>;

@injectable()
export class GetRolesUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository
    ) { }

    async execute(dto: PaginationParams<RoleOrderBy>): Promise<GetRolesResult> {
        const pagination = {
            page: dto.page ?? 1,
            limit: dto.limit ?? 10,
            orderBy: dto.orderBy ?? 'createdAt',
            direction: dto.direction ?? 'desc',
            search: dto.search ?? ''
        };

        const { items, total } = await this.roleRepository.index(pagination);

        const roleDtos: ReadRoleDto[] = items.map(role => ({
            id: role.getId(),
            name: role.getName(),
            description: role.getDescription() ?? '',
            status: role.getStatus(),
            level: role.getLevel(),
            createdAt: role.getCreatedAt()
        }));

        return Result.ok({
            items: roleDtos,
            total,
            page: pagination.page,
            limit: pagination.limit
        });
    }
}
