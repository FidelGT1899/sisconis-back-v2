import { UserHttpMapper } from '@users-infrastructure/mappers/user-http.mapper';
import type { ReadUserDto } from '@users-application/dtos/read-user.dto';

const makeReadUserDto = (overrides = {}): ReadUserDto => ({
    id: 'user-123',
    name: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    dni: '12345678',
    role: { id: 'role-1', name: 'Admin' },
    status: 'ACTIVE',
    phone: '555-0100',
    address: '123 Main St',
    photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    ...overrides,
});

describe('UserHttpMapper', () => {
    describe('toResponse', () => {
        it('should map ReadUserDto to HTTP response', () => {
            const dto = makeReadUserDto({
                updatedAt: new Date('2024-06-15T12:00:00.000Z'),
            });

            const result = UserHttpMapper.toResponse(dto);

            expect(result).toEqual({
                id: 'user-123',
                name: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dni: '12345678',
                role: { id: 'role-1', name: 'Admin' },
                status: 'ACTIVE',
                phone: '555-0100',
                address: '123 Main St',
                photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-06-15T12:00:00.000Z',
            });
        });

        it('should use createdAt as fallback for updatedAt', () => {
            const dto = makeReadUserDto();

            const result = UserHttpMapper.toResponse(dto);

            expect(result.updatedAt).toBe('2024-01-01T00:00:00.000Z');
        });

        it('should map null optional fields to null', () => {
            const dto = makeReadUserDto({
                phone: null,
                address: null,
                photoUrl: null,
            });

            const result = UserHttpMapper.toResponse(dto);

            expect(result.phone).toBeNull();
            expect(result.address).toBeNull();
            expect(result.photoUrl).toBeNull();
        });

        it('should map undefined optional fields to null', () => {
            const dto = makeReadUserDto({
                phone: undefined,
                address: undefined,
                photoUrl: undefined,
            });

            const result = UserHttpMapper.toResponse(dto);

            expect(result.phone).toBeNull();
            expect(result.address).toBeNull();
            expect(result.photoUrl).toBeNull();
        });
    });
});
