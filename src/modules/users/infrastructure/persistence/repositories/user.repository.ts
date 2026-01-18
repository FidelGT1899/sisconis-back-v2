import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma-generated";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";
import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import { PrismaErrorMapper } from "@shared-infrastructure/database/prisma/errors/prisma-error.mapper";

import type { IUserRepository, UserOrderBy } from "@users-domain/repositories/user.repository.interface";
import { UserEntity } from "@users-domain/entities/user.entity";

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
        return this.exists({ email });
    }

    async existsByDni(dni: string): Promise<boolean> {
        return this.exists({ dni });
    }

    async index(
        pagination?: PaginationParams<UserOrderBy>
    ): Promise<PaginatedResult<UserEntity>> {
        try {
            const page = pagination?.page ?? 1;
            const limit = pagination?.limit ?? 10;
            const search = pagination?.search;
            const orderBy = pagination?.orderBy ?? 'createdAt';
            const direction = pagination?.direction ?? 'desc';

            const where: Prisma.UserWhereInput = {
                deletedAt: null
            };

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    { dni: { contains: search, mode: Prisma.QueryMode.insensitive } }
                ];
            }

            const [users, total] = await this.prisma.$transaction([
                this.prisma.user.findMany({
                    where,
                    // select: {
                    //     id: true,
                    //     name: true,
                    //     lastName: true,
                    //     email: true,
                    //     createdAt: true
                    // },
                    orderBy: {
                        [orderBy]: direction
                    },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.user.count({ where })
            ]);

            return {
                // items: users.map(user => ({
                //     id: user.id,
                //     name: user.name,
                //     lastName: user.lastName,
                //     email: user.email,
                //     createdAt: user.createdAt
                // })),
                // total
                items: users.map(user => UserMapper.toDomain(user)),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async findById(id: string): Promise<UserEntity | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id, deletedAt: null }
            });
            return user ? UserMapper.toDomain(user) : null;
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async save(user: UserEntity): Promise<UserEntity> {
        try {
            const data = UserMapper.toPersistence(user);
            const created = await this.prisma.user.create({
                data
            });
            return UserMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
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
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            });
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    private async exists(where: Prisma.UserWhereInput): Promise<boolean> {
        try {
            const user = await this.prisma.user.findFirst({
                where: { ...where, deletedAt: null },
                select: { id: true }
            });
            return user !== null;
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }
}
