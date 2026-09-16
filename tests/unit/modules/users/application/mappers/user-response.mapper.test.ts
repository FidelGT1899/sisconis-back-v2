import { UserResponseMapper } from '@users-application/mappers/user-response.mapper';
import { makeUserEntity } from '@tests-factories/users/user.factory';
import { UserStatus } from '@users-domain/entities/user.entity';

describe('UserResponseMapper', () => {
    describe('toDto', () => {
        it('should map UserEntity to ReadUserDto', () => {
            const user = makeUserEntity({
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dni: '12345678',
                phone: '555-0100',
                address: '123 Main St',
                photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
            });

            const result = UserResponseMapper.toDto(user);

            expect(result.id).toBe('user-id-123');
            expect(result.name).toBe('John');
            expect(result.lastName).toBe('Doe');
            expect(result.email).toBe('john@example.com');
            expect(result.dni).toBe('12345678');
            expect(result.role).toEqual({
                id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Admin',
            });
            expect(result.status).toBe(UserStatus.ACTIVE);
            expect(result.phone).toBe('555-0100');
            expect(result.address).toBe('123 Main St');
            expect(result.photoUrl).toBe('https://res.cloudinary.com/demo/image/upload/v1/photo.jpg');
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should map undefined optional fields to null', () => {
            const user = makeUserEntity();

            const result = UserResponseMapper.toDto(user);

            expect(result.phone).toBeNull();
            expect(result.address).toBeNull();
            expect(result.photoUrl).toBeNull();
        });

        it('should not include updatedAt in the output', () => {
            const user = makeUserEntity();

            const result = UserResponseMapper.toDto(user);

            expect(result).not.toHaveProperty('updatedAt');
        });

        it('should return UserStatus enum value for status', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });

            const result = UserResponseMapper.toDto(user);

            expect(result.status).toBe(UserStatus.ACTIVE);
        });

        it('should map role reference with exact values', () => {
            const user = makeUserEntity({ roleLevel: 5 });

            const result = UserResponseMapper.toDto(user);

            expect(result.role.id).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(result.role.name).toBe('Admin');
        });
    });
});
