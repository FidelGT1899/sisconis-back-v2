import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";

@injectable()
export class ActivateRoleUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly repository: IRoleRepository
    ) { }

    async execute(id: string): Promise<Result<void, AppError>> {
        const role = await this.repository.findById(id);

        if (!role) {
            return Result.fail(new RoleNotFoundError(id));
        }

        role.activate();

        await this.repository.update(role);

        return Result.ok(undefined);
    }
}
