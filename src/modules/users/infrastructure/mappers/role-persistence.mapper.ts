import { RoleEntity, RoleStatus } from "@users-domain/entities/role.entity";
import type { Role as RolePersistenceModel } from "@prisma/client";

export class RoleMapper {
    static toDomain(raw: RolePersistenceModel): RoleEntity {
        return RoleEntity.rehydrate({
            id: raw.id,
            name: raw.name,
            description: raw.description,
            status: raw.status as RoleStatus,
            level: raw.level,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            deletedAt: raw.deletedAt ?? undefined,
            createdBy: raw.createdBy ?? undefined,
            updatedBy: raw.updatedBy ?? undefined,
            deletedBy: raw.deletedBy ?? undefined
        });
    }

    static toPersistence(entity: RoleEntity): RolePersistenceModel {
        return {
            id: entity.getId(),
            name: entity.getName(),
            description: entity.getDescription(),
            status: entity.getStatus(),
            level: entity.getLevel(),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt || new Date(),
            deletedAt: entity.deletedAt || null,
            createdBy: entity.createdBy || null,
            updatedBy: entity.updatedBy || null,
            deletedBy: entity.deletedBy || null
        };
    }
}
