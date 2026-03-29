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

@injectable()
export class UpdateUserRoleUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.RoleRepository)
        private readonly roleRepository: IRoleRepository
    ) { }

    async execute(dto: UpdateUserRoleDto): Promise<Result<void, AppError>> {
        const executor = await this.userRepository.findById(dto.executorId);
        if (!executor) return Result.fail(new UserNotFoundError(dto.executorId));

        const executorRole = await this.roleRepository.findById(executor.getRoleId());

        if (!executorRole || executorRole.getLevel() < 7) {
            return Result.fail(new UnauthorizedRoleAssignmentError());
        }

        const userToUpdate = await this.userRepository.findById(dto.userId);
        if (!userToUpdate) return Result.fail(new UserNotFoundError(dto.userId));

        const canAssign = userToUpdate.ensureRoleAssignable();
        if (canAssign.isErr()) return Result.fail(canAssign.error());

        const newRole = await this.roleRepository.findById(dto.newRoleId);
        if (!newRole) return Result.fail(new RoleNotFoundError(dto.newRoleId));

        const assignable = newRole.ensureAssignable();
        if (assignable.isErr()) return Result.fail(assignable.error());

        const roleRef = RoleReferenceVO.create({
            id: newRole.getId(),
            name: newRole.getName(),
            level: newRole.getLevel(),
            status: newRole.getStatus()
        });
        if (roleRef.isErr()) return Result.fail(roleRef.error());
        userToUpdate.changeRole(roleRef.value());

        await this.userRepository.update(userToUpdate);

        return Result.ok(undefined);
    }
}
