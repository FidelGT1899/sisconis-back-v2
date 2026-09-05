import { injectable, inject } from "inversify";

import type { AppError } from "@shared-kernel/errors/app.error";
import { Result } from "@shared-kernel/errors/result";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import type { IRoleRepository } from "@users-domain/repositories/role.repository.interface";

import { UnauthorizedRoleAssignmentError } from "@users-application/errors/unauthorized-role-assignment.error";
import { UserNotFoundError } from "@users-application/errors/user-not-found.error";
import { RoleNotFoundError } from "@users-application/errors/role/role-not-found.error";
import type { UpdateUserRoleDto } from "@users-application/dtos/update-user-role.dto";
import { RoleReferenceVO } from "@users-domain/value-objects/role-reference.vo";
import { CannotModifyOwnRoleError } from "@users-application/errors/cannot-modify-own-role.error";

@injectable()
export class UpdateUserRoleUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository
    ) { }

    async execute(dto: UpdateUserRoleDto): Promise<Result<void, AppError>> {
        if (dto.executorId === dto.userId) return Result.fail(new CannotModifyOwnRoleError());

        const executor = await this.userRepository.findById(dto.executorId);
        if (!executor) return Result.fail(new UserNotFoundError(dto.executorId));

        const userToUpdate = await this.userRepository.findById(dto.userId);
        if (!userToUpdate) return Result.fail(new UserNotFoundError(dto.userId));

        if (!executor.canManageUser(userToUpdate)) {
            return Result.fail(new UnauthorizedRoleAssignmentError());
        }

        const canAssign = userToUpdate.ensureRoleAssignable();
        if (canAssign.isErr()) return Result.fail(canAssign.error());

        const newRole = await this.roleRepository.findById(dto.newRoleId);
        if (!newRole) return Result.fail(new RoleNotFoundError(dto.newRoleId));

        if (!executor.canAssignRoleLevel(newRole.getLevel())) {
            return Result.fail(new UnauthorizedRoleAssignmentError());
        }

        const roleRef = RoleReferenceVO.create({
            id: newRole.getId(),
            name: newRole.getName(),
            level: newRole.getLevel()
        });
        if (roleRef.isErr()) return Result.fail(roleRef.error());
        userToUpdate.changeRole(roleRef.value());

        await this.userRepository.update(userToUpdate);

        return Result.ok(undefined);
    }
}
