import { UserMapper } from '@users-infrastructure/mappers/user-persistence.mapper';
import { DatabaseIntegrityError } from '@users-infrastructure/errors/database-integrity.error';
import { UserEntity, UserStatus } from '@users-domain/entities/user.entity';
import { makeUserEntity } from '@tests-factories/users/user.factory';

const makeUserPersistenceModel = (overrides = {}) => ({
    id: 'user-id-123',
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dni: '12345678',
    roleId: '550e8400-e29b-41d4-a716-446655440000',
    role: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Admin',
        level: 7,
    },
    status: 'ACTIVE',
    phone: null,
    address: null,
    photoUrl: null,
    password: 'hashed_password',
    isPasswordTemporary: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    ...overrides,
});

describe('UserMapper', () => {
    describe('toDomain', () => {
        it('should map persistence model to UserEntity', () => {
            const model = makeUserPersistenceModel();

            const entity = UserMapper.toDomain(model);

            expect(entity).toBeInstanceOf(UserEntity);
            expect(entity.getId()).toBe('user-id-123');
            expect(entity.getName()).toBe('John');
            expect(entity.getLastName()).toBe('Doe');
            expect(entity.getEmail()).toBe('john.doe@example.com');
            expect(entity.getDni()).toBe('12345678');
            expect(entity.getRoleId()).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(entity.getRoleName()).toBe('Admin');
            expect(entity.getRoleLevel()).toBe(7);
            expect(entity.getStatus()).toBe(UserStatus.ACTIVE);
            expect(entity.getPassword()).toBe('hashed_password');
            expect(entity.isPasswordTemporary()).toBe(false);
        });

        it('should map optional profile fields when present', () => {
            const model = makeUserPersistenceModel({
                phone: '555-0100',
                address: '123 Main St',
                photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
            });

            const entity = UserMapper.toDomain(model);

            expect(entity.getPhone()).toBe('555-0100');
            expect(entity.getAddress()).toBe('123 Main St');
            expect(entity.getPhotoUrl()).toBe('https://res.cloudinary.com/demo/image/upload/v1/photo.jpg');
        });

        it('should map deletedAt and audit fields when present', () => {
            const deletedAt = new Date('2024-02-01');
            const model = makeUserPersistenceModel({
                deletedAt,
                createdBy: 'admin-1',
                updatedBy: 'admin-2',
                deletedBy: 'admin-3',
            });

            const entity = UserMapper.toDomain(model);

            expect(entity.deletedAt).toBe(deletedAt);
            expect(entity.createdBy).toBe('admin-1');
            expect(entity.updatedBy).toBe('admin-2');
            expect(entity.deletedBy).toBe('admin-3');
        });

        it('should throw DatabaseIntegrityError when role relation is missing', () => {
            const model = makeUserPersistenceModel({ role: undefined });

            expect(() => UserMapper.toDomain(model)).toThrow(DatabaseIntegrityError);
            expect(() => UserMapper.toDomain(model)).toThrow(/Missing role data/);
        });

        it('should throw DatabaseIntegrityError when email is invalid', () => {
            const model = makeUserPersistenceModel({ email: 'not-an-email' });

            expect(() => UserMapper.toDomain(model)).toThrow(DatabaseIntegrityError);
            expect(() => UserMapper.toDomain(model)).toThrow(/Invalid email found in database/);
        });

        it('should throw DatabaseIntegrityError when dni is invalid', () => {
            const model = makeUserPersistenceModel({ dni: '123' });

            expect(() => UserMapper.toDomain(model)).toThrow(DatabaseIntegrityError);
            expect(() => UserMapper.toDomain(model)).toThrow(/Invalid DNI found in database/);
        });

        it('should throw DatabaseIntegrityError when role data is invalid', () => {
            const model = makeUserPersistenceModel({
                role: { id: 'role', name: 'Admin', level: 0 },
            });

            expect(() => UserMapper.toDomain(model)).toThrow(DatabaseIntegrityError);
            expect(() => UserMapper.toDomain(model)).toThrow(/Invalid role data found in database/);
        });
    });

    describe('toPersistence', () => {
        it('should map UserEntity to persistence data', () => {
            const entity = makeUserEntity({
                phone: '555-0100',
                address: '123 Main St',
                photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
            });

            const data = UserMapper.toPersistence(entity);

            expect(data.id).toBe('user-id-123');
            expect(data.name).toBe('John');
            expect(data.lastName).toBe('Doe');
            expect(data.email).toBe('john.doe@example.com');
            expect(data.dni).toBe('12345678');
            expect(data.roleId).toBe('550e8400-e29b-41d4-a716-446655440000');
            expect(data.status).toBe(UserStatus.ACTIVE);
            expect(data.phone).toBe('555-0100');
            expect(data.address).toBe('123 Main St');
            expect(data.photoUrl).toBe('https://res.cloudinary.com/demo/image/upload/v1/photo.jpg');
            expect(data.password).toBe('hashed_password');
            expect(data.isPasswordTemporary).toBe(false);
            expect(data.createdAt).toBeInstanceOf(Date);
            expect(data.deletedAt).toBeNull();
        });

        it('should map absent optional fields to null', () => {
            const entity = makeUserEntity();

            const data = UserMapper.toPersistence(entity);

            expect(data.phone).toBeNull();
            expect(data.address).toBeNull();
            expect(data.photoUrl).toBeNull();
            expect(data.deletedAt).toBeNull();
            expect(data.createdBy).toBeNull();
            expect(data.deletedBy).toBeNull();
        });

        it('should reflect temporary password flag', () => {
            const entity = makeUserEntity({ isTemporaryPassword: true });

            const data = UserMapper.toPersistence(entity);

            expect(data.isPasswordTemporary).toBe(true);
        });
    });
});