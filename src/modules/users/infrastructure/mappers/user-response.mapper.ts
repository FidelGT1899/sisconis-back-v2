import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import type { UserEntity } from "@users-domain/entities/user.entity";

export interface UserResponseDto {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    createdAt: string;
    updatedAt: string;
}

export class UserResponseMapper {
    static toResponse(user: UserEntity | ReadUserDto): UserResponseDto {
        const isEntity = 'getId' in user;

        const response: UserResponseDto = {
            id: isEntity ? user.getId() : user.id,
            name: isEntity ? user.getName() : user.name,
            lastName: isEntity ? user.getLastName() : user.lastName,
            email: isEntity ? user.getEmail() : user.email,
            dni: isEntity ? user.getDni() : user.dni,
            createdAt: (isEntity ? user.getCreatedAt() : user.createdAt).toISOString(),
            updatedAt: (isEntity ? user.getUpdatedAt() : (user.updatedAt ?? user.createdAt)).toISOString()
        };

        return response;
    }
}
