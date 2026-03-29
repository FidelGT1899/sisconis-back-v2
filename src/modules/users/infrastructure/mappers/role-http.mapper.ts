import type { RoleStatus } from "@prisma/client";
import type { ReadRoleDto } from "@users-application/dtos/role/read-role.dto";

export interface RoleResponseDto {
    id: string;
    name: string;
    description?: string | undefined;
    status: RoleStatus;
    level: number;
    createdAt: string;
    updatedAt: string;
}

export class RoleHttpMapper {
    static toResponse(dto: ReadRoleDto): RoleResponseDto {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            status: dto.status,
            level: dto.level,
            createdAt: dto.createdAt.toISOString(),
            updatedAt: (dto.updatedAt ?? dto.createdAt).toISOString()
        };
    }
}
