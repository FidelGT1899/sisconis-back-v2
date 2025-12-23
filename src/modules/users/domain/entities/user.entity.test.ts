import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { UserEntity } from "./user.entity";

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
            const user = UserEntity.create(baseProps, mockIdGenerator);

            expect(user).toBeInstanceOf(UserEntity);

            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');

            expect(user.getEmail()).toBe(baseProps.email);

            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.createdAt.getTime()).toBeCloseTo(new Date().getTime(), -100);
        });

        it('should initialize basic properties correctly via getters', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);

            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getPassword()).toBe('hashedpassword123');
        });

        it('should throw InvalidEmailError if props contains invalid email', () => {
            const invalidProps = { ...baseProps, email: 'not-an-email' };

            expect(() => UserEntity.create(invalidProps, mockIdGenerator)).toThrow();
        });
    });

    describe('changePassword', () => {
        it('should update the password and updatedAt', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);
            const oldUpdatedAt = user.updatedAt;

            user.changePassword('new-password');

            expect(user.getPassword()).toBe('new-password');
            expect(user.updatedAt).not.toBe(oldUpdatedAt);
        });
    });
});