import type { RoleStatus } from "@users-domain/entities/role.entity";

export interface ReadRoleDto {
    id: string;
    name: string;
    description: string;
    level: number;
    status: RoleStatus;
    createdAt: Date;
    updatedAt?: Date;
}
