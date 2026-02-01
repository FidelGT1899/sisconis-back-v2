import { injectable, inject } from "inversify";

import { Result } from "@shared-kernel/errors/result";
import type { AppError } from "@shared-kernel/errors/app.error";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { RoleEntity } from "@users-domain/entities/role.entity";
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";

export type GetRoleResult = Result<RoleEntity, AppError>;

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

        return Result.ok(role);
    }
}
