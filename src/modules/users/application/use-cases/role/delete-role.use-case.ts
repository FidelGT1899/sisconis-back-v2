import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";

import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";
import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { RoleHasUsersError } from "@users-domain/errors/role-has-users.error";

export type DeleteRoleResult = Result<void, AppError>;

@injectable()
export class DeleteRoleUseCase {
    constructor(
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository,
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository
    ) { }

    async execute(id: string): Promise<DeleteRoleResult> {
        const role = await this.roleRepository.findById(id);

        if (!role) {
            return Result.fail(new RoleNotFoundError(id));
        }

        const deletable = role.ensureDeletable();
        if (deletable.isErr()) return Result.fail(deletable.error());

        const hasUsers = await this.userRepository.existsByRoleId(id);
        if (hasUsers) return Result.fail(new RoleHasUsersError(id));

        await this.roleRepository.delete(id);

        return Result.ok(undefined);
    }
}
