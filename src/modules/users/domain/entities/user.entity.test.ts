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
    describe('create', () => {
        it('should create a new UserEntity with generated ID and current dates', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);

            expect(user).toBeInstanceOf(UserEntity);

            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');

            expect(user.getEmail()).toBe(baseProps.email);

            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeUndefined();
        });

        it('should initialize basic properties correctly via getters', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);

            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getPassword()).toBe('hashedpassword123');
        });

        it('should throw InvalidEmailError if props contains invalid email', () => {
            const invalidProps = { ...baseProps, email: 'not-an-email' };

            expect(() =>
                UserEntity.create(invalidProps, mockIdGenerator)
            ).toThrow(InvalidEmailError);
        });
    });

    describe('fromExisting', () => {
        it('should recreate a UserEntity keeping id and createdAt, and updating updatedAt', () => {
            const createdAt = new Date('2024-01-01');

            const user = UserEntity.fromExisting(
                'existing-id-123',
                baseProps,
                createdAt
            );

            expect(user).toBeInstanceOf(UserEntity);

            expect(user.getId()).toBe('existing-id-123');
            expect(user.createdAt).toBe(createdAt);

            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.updatedAt).not.toBe(createdAt);

            expect(user.getName()).toBe(baseProps.name);
            expect(user.getLastName()).toBe(baseProps.lastName);
            expect(user.getEmail()).toBe(baseProps.email);
            expect(user.getPassword()).toBe(baseProps.password);
        });

        it('should throw InvalidEmailError if email is invalid', () => {
            const createdAt = new Date();

            const invalidProps = { ...baseProps, email: 'invalid-email' };

            expect(() =>
                UserEntity.fromExisting(
                    'existing-id-123',
                    invalidProps,
                    createdAt
                )
            ).toThrow(InvalidEmailError);
        });
    });


    describe('changePassword', () => {
        it('should update the password and updatedAt', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);
            const oldUpdatedAt = user.updatedAt;

            user.changePassword('new-password');

            expect(user.getPassword()).toBe('new-password');
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.updatedAt).not.toBe(oldUpdatedAt);
        });
    });
});
