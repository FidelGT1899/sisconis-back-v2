import { DniVO } from "@users-domain/value-objects/dni.vo";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { TemporaryPasswordVO } from "@users-domain/value-objects/temporary-password.vo";
import { UserEntity, UserStatus } from "@users-domain/entities/user.entity";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { RoleReferenceVO } from "@users-domain/value-objects/role-reference.vo";
import type { RoleStatus } from "@users-domain/entities/role.entity";
import { DatabaseIntegrityError } from "@users-infrastructure/errors/database-integrity.error";

interface UserPersistenceModel {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    roleId: string;
    role: {
        id: string;
        name: string;
        level: number;
        status: string;
    };
    status: string;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
    password: string;
    isPasswordTemporary: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    deletedBy: string | null;
}

interface UserPersistenceData {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    roleId: string;
    status: UserStatus;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
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
        if (!raw.role) {
            throw new DatabaseIntegrityError(
                'User',
                raw.id,
                'Missing role data. Ensure the repository includes the role relation.'
            );
        }

        const emailResult = EmailVO.create(raw.email);

        if (emailResult.isErr()) {
            throw new DatabaseIntegrityError(
                'User',
                raw.id,
                `Invalid email found in database: ${raw.email}`
            );
        }

        const dniResult = DniVO.create(raw.dni);
        if (dniResult.isErr()) {
            throw new DatabaseIntegrityError(
                'User',
                raw.id,
                `Invalid DNI found in database: ${raw.dni}`
            );
        }

        const passwordVo = raw.isPasswordTemporary
            ? TemporaryPasswordVO.fromHashed(raw.password)
            : PasswordVO.fromHashed(raw.password);

        const roleRefResult = RoleReferenceVO.create({
            id: raw.role.id,
            name: raw.role.name,
            level: raw.role.level,
            status: raw.role.status as RoleStatus,
        });

        if (roleRefResult.isErr()) {
            throw new DatabaseIntegrityError(
                'User',
                raw.id,
                `Invalid role data found in database: ${raw.role.id}, Error: ${roleRefResult.error().message}`
            );
        }

        return UserEntity.rehydrate({
            id: raw.id,
            name: raw.name,
            lastName: raw.lastName,
            email: emailResult.value(),
            dni: dniResult.value(),
            role: roleRefResult.value(),
            password: passwordVo,
            status: raw.status as UserStatus,
            ...(raw.phone && { phone: raw.phone }),
            ...(raw.address && { address: raw.address }),
            ...(raw.photoUrl && { photoUrl: raw.photoUrl }),
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            deletedAt: raw.deletedAt ?? undefined,
            createdBy: raw.createdBy ?? undefined,
            updatedBy: raw.updatedBy ?? undefined,
            deletedBy: raw.deletedBy ?? undefined
        });
    }

    static toPersistence(entity: UserEntity): UserPersistenceData {
        return {
            id: entity.getId(),
            name: entity.getName(),
            lastName: entity.getLastName(),
            email: entity.getEmail(),
            dni: entity.getDni(),
            roleId: entity.getRoleId(),
            status: entity.getStatus(),
            phone: entity.getPhone() ?? null,
            address: entity.getAddress() ?? null,
            photoUrl: entity.getPhotoUrl() ?? null,
            password: entity.getPassword(),
            isPasswordTemporary: entity.isPasswordTemporary(),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt ?? new Date(),
            deletedAt: entity.deletedAt || null,
            createdBy: entity.createdBy || null,
            updatedBy: entity.updatedBy || null,
            deletedBy: entity.deletedBy || null
        };
    }
}
