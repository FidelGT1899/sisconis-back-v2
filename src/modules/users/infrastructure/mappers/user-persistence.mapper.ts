import { DniVO } from "@modules/users/domain/value-objects/dni.vo";
import { PasswordVO } from "@modules/users/domain/value-objects/password.vo";
import { TemporaryPasswordVO } from "@modules/users/domain/value-objects/temporary-password.vo";
import { UserEntity } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";

interface UserPersistenceModel {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    password: string;
    isPasswordTemporary: boolean;
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
        const dniVo = DniVO.create(raw.dni);
        const passwordVo = raw.isPasswordTemporary
            ? TemporaryPasswordVO.fromHashed(raw.password)
            : PasswordVO.fromHashed(raw.password);

        if (emailResult.isErr()) {
            throw new Error(`Integrity Error: Database user ${raw.id} has an invalid email.`);
        }

        return UserEntity.rehydrate({
            id: raw.id,
            name: raw.name,
            lastName: raw.lastName,
            email: emailResult.value(),
            dni: dniVo.value(),
            password: passwordVo,
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
            dni: entity.getDni(),
            password: entity.getPassword(),
            isPasswordTemporary: entity.isPasswordTemporary(),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt || new Date(),
            deletedAt: entity.deletedAt || null,
            createdBy: entity.createdBy || null,
            updatedBy: entity.updatedBy || null,
            deletedBy: entity.deletedBy || null
        };
    }
}
