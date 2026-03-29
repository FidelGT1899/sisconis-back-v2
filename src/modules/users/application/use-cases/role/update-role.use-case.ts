import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import type { UpdateRoleDto } from "@users-application/dtos/role/update-role.dto";
import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";
import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";
import { RoleResponseMapper } from "@users-application/mappers/role-response.mapper";

export type UpdateRoleResult = Result<ReadRoleDto, AppError>

@injectable()
export class UpdateRoleUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository
    ) { }

    async execute(dto: UpdateRoleDto): Promise<UpdateRoleResult> {
        const role = await this.roleRepository.findById(dto.id);

        if (!role) {
            return Result.fail(new RoleNotFoundError(dto.id));
        }

        role.updateDetails(
            dto.name ?? role.getName(),
            dto.description ?? role.getDescription()
        );

        await this.roleRepository.update(role);

        return Result.ok(RoleResponseMapper.toDto(role));
    }
}
