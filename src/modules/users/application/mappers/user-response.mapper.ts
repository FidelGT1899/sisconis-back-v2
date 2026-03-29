import type { ReadUserDto } from "@users-application/dtos/read-user.dto";
import type { UserEntity } from "@users-domain/entities/user.entity";

export class UserResponseMapper {
    static toDto(user: UserEntity): ReadUserDto {
        return {
            id: user.getId(),
            name: user.getName(),
            lastName: user.getLastName(),
            email: user.getEmail(),
            dni: user.getDni(),
            role: {
                id: user.getRoleId(),
                name: user.getRole().getName(),
            },
            status: user.getStatus(),
            phone: user.getPhone() ?? null,
            address: user.getAddress() ?? null,
            photoUrl: user.getPhotoUrl() ?? null,
            createdAt: user.getCreatedAt()
        };
    }
}
