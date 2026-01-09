import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { UserEntity } from "./user.entity";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";

const mockIdGenerator: IIdGenerator = {
    generate: jest.fn(() => 'mock-uuid-12345'),
};

const baseProps = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedpassword123',
};

describe('UserEntity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new UserEntity with generated ID and current dates', () => {
            const result = UserEntity.create(baseProps, mockIdGenerator);

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user).toBeInstanceOf(UserEntity);
            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');
            expect(user.getEmail()).toBe(baseProps.email);
            expect(user.createdAt).toBeInstanceOf(Date);
        });

        it('should initialize basic properties correctly via getters', () => {
            const result = UserEntity.create(baseProps, mockIdGenerator);
            const user = result.value();

            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getPassword()).toBe('hashedpassword123');
        });

        it('should return failure with InvalidEmailError if email is invalid', () => {
            const invalidProps = { ...baseProps, email: 'not-an-email' };
            const result = UserEntity.create(invalidProps, mockIdGenerator);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });
    });

    describe('fromExisting', () => {
        it('should recreate a UserEntity keeping id and createdAt', () => {
            const createdAt = new Date('2024-01-01');

            const result = UserEntity.fromExisting(
                'existing-id-123',
                baseProps,
                createdAt
            );

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user.getId()).toBe('existing-id-123');
            expect(user.createdAt).toBe(createdAt);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.getEmail()).toBe(baseProps.email);
        });

        it('should return failure if existing data has invalid email', () => {
            const result = UserEntity.fromExisting(
                'id',
                { ...baseProps, email: 'invalid' },
                new Date()
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });
    });

    describe('changePassword', () => {
        it('should update the password and updatedAt', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();
            const oldUpdatedAt = user.updatedAt;

            const success = user.changePassword('new-password');

            expect(success).toBe(true);
            expect(user.getPassword()).toBe('new-password');
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.updatedAt).not.toBe(oldUpdatedAt);
        });
    });
});
