import { injectable, inject } from "inversify";
import { PrismaClient, Prisma } from "@prisma/client";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { PaginatedResult } from "@shared-kernel/utils/paginated-result";
import type { PaginationParams } from "@shared-kernel/utils/pagination-params";
import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import { PrismaErrorMapper } from "@shared-infrastructure/database/prisma/errors/prisma-error.mapper";

import type { IRoleRepository, RoleOrderBy } from "@users-domain/repositories/role.repository.interface";
import { RoleEntity } from "@users-domain/entities/role.entity";

import { RoleMapper } from "@users-infrastructure/mappers/role-persistence.mapper";

@injectable()
export class RoleRepository implements IRoleRepository {
    private readonly prisma: PrismaClient;

    constructor(
        @inject(TYPES.PrismaService)
        prismaService: PrismaService
    ) {
        this.prisma = prismaService.getClient();
    }

    async existsByName(name: string): Promise<boolean> {
        return this.exists({ name });
    }

    async existsByLevel(level: number): Promise<boolean> {
        return this.exists({ level });
    }

    async index(
        pagination?: PaginationParams<RoleOrderBy>
    ): Promise<PaginatedResult<RoleEntity>> {
        try {
            const page = pagination?.page ?? 1;
            const limit = pagination?.limit ?? 10;
            const search = pagination?.search;
            const orderBy = pagination?.orderBy ?? 'createdAt';
            const direction = pagination?.direction ?? 'desc';

            const where: Prisma.RoleWhereInput = {
                deletedAt: null
            };

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
                ];
            }

            const [roles, total] = await this.prisma.$transaction([
                this.prisma.role.findMany({
                    where,
                    orderBy: {
                        [orderBy]: direction
                    },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.role.count({ where })
            ]);

            return {
                items: roles.map(role => RoleMapper.toDomain(role)),
                total
            };
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async findById(id: string): Promise<RoleEntity | null> {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id, deletedAt: null }
            });
            return role ? RoleMapper.toDomain(role) : null;
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async save(role: RoleEntity): Promise<RoleEntity> {
        try {
            const data = RoleMapper.toPersistence(role);
            const created = await this.prisma.role.create({
                data
            });
            return RoleMapper.toDomain(created);
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async update(role: RoleEntity): Promise<RoleEntity> {
        try {
            const data = RoleMapper.toPersistence(role);
            const updated = await this.prisma.role.update({
                where: { id: role.getId() },
                data
            });
            return RoleMapper.toDomain(updated);
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.role.update({
                where: { id, deletedAt: null },
                data: { deletedAt: new Date() }
            });
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }

    private async exists(where: Prisma.RoleWhereInput): Promise<boolean> {
        try {
            const role = await this.prisma.role.findFirst({
                where: { ...where, deletedAt: null },
                select: { id: true }
            });
            return role !== null;
        } catch (error) {
            throw PrismaErrorMapper.mapError(error);
        }
    }
}
