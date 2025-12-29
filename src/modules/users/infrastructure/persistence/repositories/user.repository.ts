import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserMapper } from "@users-infrastructure/mappers/user-persistence.mapper";
import { UserEntity } from "@users-domain/entities/user.entity";
import { PrismaClient } from "@prisma-generated";
import { injectable, inject } from "inversify";
import { TYPES } from "@shared-kernel/ioc/types";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import type { PaginationUsersDto } from "@modules/users/application/dtos/pagination-users.dto";

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

    async index(pagination: PaginationUsersDto): Promise<UserEntity[]> {
        try {
            const users = await this.prisma.user.findMany({
                where: {
                    deletedAt: null,
                    ...(pagination.search && {
                        OR: [
                            { name: { contains: pagination.search, mode: 'insensitive' } },
                            { lastName: { contains: pagination.search, mode: 'insensitive' } },
                            { email: { contains: pagination.search, mode: 'insensitive' } }
                        ]
                    })
                },
                orderBy: {
                    [pagination.orderBy]: pagination.direction
                },
                skip: (pagination.page - 1) * pagination.limit,
                take: pagination.limit
            });

            return users.map(user => UserMapper.toDomain(user));
        } catch {
            throw new InfrastructureError(
                "DATABASE_UNAVAILABLE",
                "Database is not reachable",
                503
            );
        }
    }


    async find(id: string): Promise<UserEntity | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id, deletedAt: null }
            });
            return user ? UserMapper.toDomain(user) : null;
        } catch (_error) {
            throw new InfrastructureError("DATABASE_UNAVAILABLE", "Database is not reachable", 503);
        }
    }

    async save(user: UserEntity): Promise<UserEntity> {
        try {
            const data = UserMapper.toPersistence(user);
            const created = await this.prisma.user.create({
                data
            });
            return UserMapper.toDomain(created);
        } catch (_error) {
            throw new InfrastructureError("DATABASE_UNAVAILABLE", "Database is not reachable", 503);
        }
    }

    async update(user: UserEntity): Promise<UserEntity> {
        try {
            const data = UserMapper.toPersistence(user);
            const updated = await this.prisma.user.update({
                where: { id: user.getId() },
                data
            });
            return UserMapper.toDomain(updated);
        } catch (_error) {
            throw new InfrastructureError("DATABASE_UNAVAILABLE", "Database is not reachable", 503);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            });
        } catch (_error) {
            throw new InfrastructureError("DATABASE_UNAVAILABLE", "Database is not reachable", 503);
        }
    }
}
