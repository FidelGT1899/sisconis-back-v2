import type { RoleStatus } from "@prisma/client";
import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";
import type { RoleEntity } from "@users-domain/entities/role.entity";


export interface RoleResponseDto {
    id: string;
    name: string;
    description?: string | undefined;
    status: RoleStatus;
    level: number;
    createdAt: string;
    updatedAt: string;
}

export class RoleResponseMapper {
    static toResponse(role: RoleEntity | ReadRoleDto): RoleResponseDto {
        const isEntity = 'getId' in role;

        const response: RoleResponseDto = {
            id: isEntity ? role.getId() : role.id,
            name: isEntity ? role.getName() : role.name,
            status: isEntity ? role.getStatus() : role.status,
            level: isEntity ? role.getLevel() : role.level,
            createdAt: (isEntity ? role.getCreatedAt() : role.createdAt).toISOString(),
            updatedAt: (isEntity ? role.getUpdatedAt() : (role.updatedAt ?? role.createdAt)).toISOString()
        };

        const description = isEntity ? role.getDescription() : role.description;

        if (description) {
            response.description = description;
        }

        return response;
    }
}
