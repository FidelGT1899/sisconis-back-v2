import type { IUserRepository } from "@modules/users/domain/repositories/user.repository.interface";
import { UserMapper } from "@modules/users/infrastructure/mappers/user-persistence.mapper";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { PrismaClient } from "../../../../../../generated/prisma";
import { injectable, inject } from "inversify";
import { TYPES } from "@shared-kernel/ioc/types";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";

@injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @inject(TYPES.PrismaClient)
        private readonly prisma: PrismaClient
    ) { }

    async existsByEmail(email: string): Promise<boolean> {
        try {
            const user = await this.prisma.user.count({
                where: { email }
            });
            return user > 0;
        } catch (_error) {
            throw new InfrastructureError("DATABASE_UNAVAILABLE", "Database is not reachable", 503);
        }
    }

    index(): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }

    find(_id: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }

    async save(user: UserEntity): Promise<UserEntity> {
        const data = UserMapper.toPersistence(user);
        const created = await this.prisma.user.create({
            data
        });
        return UserMapper.toDomain(created);
    }

    update(_user: UserEntity): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }

    delete(_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}