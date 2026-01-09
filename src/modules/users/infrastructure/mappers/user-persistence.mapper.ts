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
        const emailResult = EmailVO.create(raw.email);

        if (emailResult.isErr()) {
            throw new Error(`Integrity Error: Database user ${raw.id} has an invalid email.`);
        }

        return UserEntity.rehydrate({
            id: raw.id,
            name: raw.name,
            lastName: raw.lastName,
            email: emailResult.value(),
            password: raw.password,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            deletedAt: raw.deletedAt ?? undefined,
            createdBy: raw.createdBy ?? undefined,
            updatedBy: raw.updatedBy ?? undefined,
            deletedBy: raw.deletedBy ?? undefined
        });
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
