import type { ReadUserDto } from "@modules/users/application/dtos/read-user.dto";
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
    static toResponse(user: UserEntity | ReadUserDto): UserResponseDto {
        if ('getId' in user) {
            return {
                id: user.getId(),
                name: user.getName(),
                lastName: user.getLastName(),
                email: user.getEmail(),
                createdAt: user.getCreatedAt().toISOString(),
                updatedAt: user.getUpdatedAt().toISOString()
            };
        }
        return {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.createdAt.toISOString()
        };
    }
}
