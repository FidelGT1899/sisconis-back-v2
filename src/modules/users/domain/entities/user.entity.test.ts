import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { UserEntity } from "./user.entity";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";

const mockIdGenerator: IIdGenerator = {
    generate: jest.fn(() => 'mock-uuid-12345'),
};

const baseProps = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dni: '12345678',
};

const basePropsWithPassword = {
    ...baseProps,
    password: 'hashedpassword123',
};

describe('UserEntity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new UserEntity with generated ID and temporary password from DNI', () => {
            const result = UserEntity.create(baseProps, mockIdGenerator);

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user).toBeInstanceOf(UserEntity);
            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');
            expect(user.getEmail()).toBe(baseProps.email);
            expect(user.getDni()).toBe(baseProps.dni);
            expect(user.getPassword()).toBe(baseProps.dni);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.isPasswordTemporary()).toBe(true);
        });

        it('should initialize basic properties correctly via getters', () => {
            const result = UserEntity.create(baseProps, mockIdGenerator);
            const user = result.value();

            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getDni()).toBe('12345678');
        });

        it('should return failure with InvalidEmailError if email is invalid', () => {
            const invalidProps = { ...baseProps, email: 'not-an-email' };
            const result = UserEntity.create(invalidProps, mockIdGenerator);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });

        it('should return failure with InvalidDniError if DNI is invalid', () => {
            const invalidProps = { ...baseProps, dni: 'invalid-dni' };
            const result = UserEntity.create(invalidProps, mockIdGenerator);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidDniError);
        });
    });

    describe('fromExisting', () => {
        it('should recreate a UserEntity with hashed password keeping id and createdAt', () => {
            const createdAt = new Date('2024-01-01');

            const result = UserEntity.fromExisting(
                'existing-id-123',
                basePropsWithPassword,
                createdAt
            );

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user.getId()).toBe('existing-id-123');
            expect(user.createdAt).toBe(createdAt);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.getEmail()).toBe(baseProps.email);
            expect(user.getPassword()).toBe('hashedpassword123');
            expect(user.getDni()).toBe(baseProps.dni);
            expect(user.isPasswordTemporary()).toBe(false);
        });

        it('should return failure if existing data has invalid email', () => {
            const result = UserEntity.fromExisting(
                'id',
                { ...basePropsWithPassword, email: 'invalid' },
                new Date()
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });

        it('should return failure if existing data has invalid DNI', () => {
            const result = UserEntity.fromExisting(
                'id',
                { ...basePropsWithPassword, dni: 'invalid' },
                new Date()
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidDniError);
        });
    });

    describe('isPasswordTemporary', () => {
        it('should return true when user has temporary password', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();

            expect(user.isPasswordTemporary()).toBe(true);
        });

        it('should return false when user has regular password', () => {
            const user = UserEntity.fromExisting(
                'id-123',
                basePropsWithPassword,
                new Date()
            ).value();

            expect(user.isPasswordTemporary()).toBe(false);
        });

        it('should return false after changing password', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();

            expect(user.isPasswordTemporary()).toBe(true);

            user.changePassword('NewPassword123');

            expect(user.isPasswordTemporary()).toBe(false);
        });
    });

    describe('changePassword', () => {
        it('should update the password and updatedAt when password is valid', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();
            const oldPassword = user.getPassword();

            const result = user.changePassword('NewPassword123');

            expect(result.isOk()).toBe(true);
            expect(user.getPassword()).toBe('NewPassword123');
            expect(user.getPassword()).not.toBe(oldPassword);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should update updatedAt on subsequent password changes', () => {
            jest.useFakeTimers();
            const startTime = new Date('2024-01-01T00:00:00.000Z');
            jest.setSystemTime(startTime);

            const user = UserEntity.create(baseProps, mockIdGenerator).value();

            const result1 = user.changePassword('FirstPassword123');
            expect(result1.isOk()).toBe(true);
            const firstUpdatedAt = user.updatedAt;

            expect(firstUpdatedAt).toBeInstanceOf(Date);
            expect(firstUpdatedAt?.getTime()).toBe(startTime.getTime());

            jest.advanceTimersByTime(1000);

            const result2 = user.changePassword('SecondPassword456');
            expect(result2.isOk()).toBe(true);
            const secondUpdatedAt = user.updatedAt;

            expect(secondUpdatedAt).toBeInstanceOf(Date);
            expect(secondUpdatedAt?.getTime()).toBeGreaterThan(firstUpdatedAt?.getTime() || 0);
            expect(secondUpdatedAt?.getTime()).toBe(startTime.getTime() + 1000);

            jest.useRealTimers();
        });

        it('should return failure with InvalidPasswordError when password is invalid', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();
            const oldPassword = user.getPassword();

            const result = user.changePassword('weak');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
            expect(user.getPassword()).toBe(oldPassword);
        });

        it('should change temporary password to regular password', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();

            expect(user.isPasswordTemporary()).toBe(true);

            const result = user.changePassword('NewPassword123');

            expect(result.isOk()).toBe(true);
            expect(user.isPasswordTemporary()).toBe(false);
            expect(user.getPassword()).toBe('NewPassword123');
        });

        it('should not update updatedAt when password change fails', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator).value();
            const initialUpdatedAt = user.updatedAt;

            const result = user.changePassword('invalid');

            expect(result.isErr()).toBe(true);
            expect(user.updatedAt).toBe(initialUpdatedAt);
        });
    });

    describe('rehydrate', () => {
        it('should rehydrate a UserEntity from props', () => {
            const emailVO = EmailVO.create('jane@example.com');
            const passwordVO = PasswordVO.fromHashed('hashedpass');
            const dniVO = DniVO.create('87654321');

            if (emailVO.isErr() || dniVO.isErr()) {
                throw new Error('Failed to create VOs');
            }

            const props = {
                id: 'rehydrated-id',
                name: 'Jane',
                lastName: 'Smith',
                email: emailVO.value(),
                password: passwordVO,
                dni: dniVO.value(),
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-06-01'),
            };

            const user = UserEntity.rehydrate(props);

            expect(user).toBeInstanceOf(UserEntity);
            expect(user.getId()).toBe('rehydrated-id');
            expect(user.getName()).toBe('Jane');
            expect(user.getLastName()).toBe('Smith');
            expect(user.getEmail()).toBe('jane@example.com');
            expect(user.getPassword()).toBe('hashedpass');
            expect(user.getDni()).toBe('87654321');
        });
    });
});
