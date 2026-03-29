import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";
import type { RoleEntity } from "@users-domain/entities/role.entity";

export class RoleResponseMapper {
    static toDto(role: RoleEntity): ReadRoleDto {
        const dto: ReadRoleDto = {
            id: role.getId(),
            name: role.getName(),
            status: role.getStatus(),
            level: role.getLevel(),
            createdAt: role.getCreatedAt(),
            updatedAt: role.getUpdatedAt(),
        };

        const description = role.getDescription();
        if (description !== null) {
            dto.description = description;
        }

        return dto;
    }
}
