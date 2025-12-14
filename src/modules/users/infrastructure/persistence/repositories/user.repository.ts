import type { IUserRepository } from "@modules/users/domain/repositories/user.repository.interface";
import { UserMapper } from "@modules/users/infrastructure/mappers/user.mapper";
import { UserEntity } from "@modules/users/domain/entities/user.entity";
import { PrismaClient } from "@prisma/client";

export class UserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}
    
    async existsByEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.count({ 
            where: { email } 
        });
        return user > 0;
    }

    async index(): Promise<UserEntity[]> {
        throw new Error("Method not implemented.");
    }    

    async find(_id: string): Promise<UserEntity | null> {
        throw new Error("Method not implemented.");
    }

    async save(user: UserEntity): Promise<UserEntity> {
        const userPersistence = UserMapper.toPersistence(user);
        const userCreated = await this.prisma.user.create({ 
            data: {
                id: userPersistence.id,
                name: userPersistence.name,
                lastName: userPersistence.lastName,
                email: userPersistence.email,
                password: userPersistence.password,
                createdAt: userPersistence.createdAt,
                updatedAt: userPersistence.updatedAt,
                deletedAt: userPersistence.deletedAt,
                createdBy: userPersistence.createdBy,
                updatedBy: userPersistence.updatedBy,
                deletedBy: userPersistence.deletedBy
            }
        });
        return UserMapper.toDomain(userCreated);
    }

    async update(_user: UserEntity): Promise<UserEntity> {
        throw new Error("Method not implemented.");
    }

    async delete(_id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}