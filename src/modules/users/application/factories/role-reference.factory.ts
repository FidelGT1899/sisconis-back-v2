import { Result } from "@shared-kernel/errors/result";
import { AppError } from "@shared-kernel/errors/app.error";

import { RoleEntity } from "@users-domain/entities/role.entity";
import { RoleReferenceVO } from "@users-domain/value-objects/role-reference.vo";

import { FailedToCreateRoleReferenceError } from "@users-application/errors/role/failed-to-create-role-reference.error";

export class RoleReferenceFactory {
    static fromRoleEntity(role: RoleEntity): Result<RoleReferenceVO, AppError> {
        const roleRefResult = RoleReferenceVO.create({
            id: role.getId(),
            name: role.getName(),
            level: role.getLevel(),
            status: role.getStatus(),
        });

        if (roleRefResult.isErr()) {
            return Result.fail(
                new FailedToCreateRoleReferenceError(
                    role.getName(),
                    roleRefResult.error().message
                )
            );
        }

        return Result.ok(roleRefResult.value());
    }
}
