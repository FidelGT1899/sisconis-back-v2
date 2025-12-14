import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";

interface UserPersistenceModel {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    deletedBy: string | null;
}

export class UserMapper {
    static toDomain(raw: UserPersistenceModel): UserEntity {
        return Object.assign(
            Object.create(UserEntity.prototype),
            {
                id: raw.id,
                name: raw.name,
                lastName: raw.lastName,
                email: EmailVO.create(raw.email),
                password: raw.password,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
                deletedAt: raw.deletedAt,
                createdBy: raw.createdBy,
                updatedBy: raw.updatedBy,
                deletedBy: raw.deletedBy
            }
        ) as UserEntity;
    }

    static toPersistence(entity: UserEntity): UserPersistenceModel {
        return {
            id: entity.getId(),
            name: entity.getName(),
            lastName: entity.getLastName(),
            email: entity.getEmail(),
            password: entity.getPassword(),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt || new Date(),
            deletedAt: entity.deletedAt || null,
            createdBy: entity.createdBy || null,
            updatedBy: entity.updatedBy || null,
            deletedBy: entity.deletedBy || null
        };
    }
}