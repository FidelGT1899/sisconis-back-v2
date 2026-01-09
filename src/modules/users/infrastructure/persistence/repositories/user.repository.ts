import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma-generated";

import { TYPES } from "@shared-kernel/ioc/types";
import { InfrastructureError } from "@shared-kernel/errors/infrastructure.error";
import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";

import type { IUserRepository } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

import type { PaginationUsersDto } from "@users-application/dtos/pagination-users.dto";
import type { ReadUserDto } from "@users-application/dtos/read-user.dto";

import { UserMapper } from "@users-infrastructure/mappers/user-persistence.mapper";

@injectable()
export class UserRepository implements IUserRepository {
    private readonly prisma: PrismaClient;

    constructor(
        @inject(TYPES.PrismaService)
        prismaService: PrismaService
    ) {
        this.prisma = prismaService.getClient();
    }

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
    ): Promise<{ items: ReadUserDto[]; total: number }> {
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
                    select: {
                        id: true,
                        name: true,
                        lastName: true,
                        email: true,
                        createdAt: true
                    },
                    orderBy: {
                        [pagination.orderBy ?? 'createdAt']: pagination.direction ?? 'desc'
                    },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.user.count({ where })
            ]);

            return {
                items: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    createdAt: user.createdAt
                })),
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
