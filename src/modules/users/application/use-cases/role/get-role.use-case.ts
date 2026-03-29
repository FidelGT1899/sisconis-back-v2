import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";
import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";
import { RoleResponseMapper } from "@users-application/mappers/role-response.mapper";

export type GetRoleResult = Result<ReadRoleDto, AppError>;

@injectable()
export class GetRoleUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository
    ) { }

    async execute(id: string): Promise<GetRoleResult> {
        const role = await this.roleRepository.findById(id);

        if (!role) {
            return Result.fail(new RoleNotFoundError(id));
        }

        return Result.ok(RoleResponseMapper.toDto(role));
    }
}
