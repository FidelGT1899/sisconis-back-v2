import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";
import { RoleEntity } from "@users-domain/entities/role.entity";

import type { UpdateRoleDto } from "@users-application/dtos/role/update-role.dto";
import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";

export type UpdateRoleResult = Result<RoleEntity, AppError>

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

        return Result.ok(role);
    }
}
