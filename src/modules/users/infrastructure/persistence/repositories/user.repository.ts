import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma-generated";

import { TYPES } from "@shared-kernel/ioc/types";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";

import type { PaginationUsersDto } from "@users-application/dtos/pagination-users.dto";

import { UserMapper } from "@users-infrastructure/mappers/user-persistence.mapper";
import { UserEntity } from "@users-domain/entities/user.entity";

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

    async index(
        pagination: PaginationUsersDto
    ): Promise<{ items: UserEntity[]; total: number }> {
        try {
            const page = pagination.page ?? 1;
            const limit = pagination.limit ?? 10;

            const where: Prisma.UserWhereInput = {
                deletedAt: null
            };

            if (pagination.search) {
                where.OR = [
                    { name: { contains: pagination.search, mode: Prisma.QueryMode.insensitive } },
                    { lastName: { contains: pagination.search, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: pagination.search, mode: Prisma.QueryMode.insensitive } }
                ];
            }

            const [users, total] = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where,
                    orderBy: {
                        [pagination.orderBy ?? 'createdAt']: pagination.direction ?? 'desc'
                    },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.user.count({ where })
            ]);

            return {
                items: users.map(user => UserMapper.toDomain(user)),
                total
            };
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
