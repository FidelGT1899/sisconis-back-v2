import type { ReadUserDto } from "@users-application/dtos/read-user.dto";

export interface UserResponseDto {
    id: string;
    name: string;
    lastName: string;
    email: string;
    dni: string;
    role: {
        id: string;
        name: string;
    };
    status: string;
    phone: string | null;
    address: string | null;
    photoUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export class UserHttpMapper {
    static toResponse(dto: ReadUserDto): UserResponseDto {
        return {
            id: dto.id,
            name: dto.name,
            lastName: dto.lastName,
            email: dto.email,
            dni: dto.dni,
            role: {
                id: dto.role.id,
                name: dto.role.name,
            },
            status: dto.status,
            phone: dto.phone ?? null,
            address: dto.address ?? null,
            photoUrl: dto.photoUrl ?? null,
            createdAt: dto.createdAt.toISOString(),
            updatedAt: (dto.updatedAt ?? dto.createdAt).toISOString()
        };
    }
}
