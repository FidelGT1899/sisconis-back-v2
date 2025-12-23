import type { UserEntity } from "@modules/users/domain/entities/user.entity";

export interface UserResponseDto {
    id: string;
    name: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export class UserResponseMapper {
    static toResponse(entity: UserEntity): UserResponseDto {
        return {
            id: entity.getId(),
            name: entity.getName(),
            lastName: entity.getLastName(),
            email: entity.getEmail(),
            createdAt: entity.createdAt.toISOString(),
            updatedAt: (entity.createdAt || entity.updatedAt).toISOString()
        };
    }
}