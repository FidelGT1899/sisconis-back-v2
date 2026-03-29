import { UserEntity, UserStatus } from "./user.entity";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";
import { makeMockIdGenerator, makeMockPasswordHasher } from "@users-tests/factories/mocks";
import { makeExistingUserProps, makeUserEntity, makeUserProps } from "@users-tests/factories/user.factory";
import { makeRoleReference } from "@users-tests/factories/role.factory";
import { CannotAssignRoleError } from "@users-domain/errors/cannot-assign-role.error";
import { UserAlreadyActiveError } from "@users-domain/errors/user-already-active.error";
import { UserAlreadyInactiveError } from "@users-domain/errors/user-already-deactive.error";
import { UserAlreadySuspendedError } from "@users-domain/errors/user-already-suspended.error";
import { UserNotDeletableError } from "@users-domain/errors/user-not-deletable.error";
import { UserNotActiveError } from "@users-domain/errors/user-not-active.error";

const mockIdGenerator = makeMockIdGenerator();
const mockPasswordHasher = makeMockPasswordHasher();

describe('UserEntity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIdGenerator.generate.mockReturnValue('mock-uuid-12345');
        mockPasswordHasher.hash.mockResolvedValue('hashed_12345678');
    });

    describe('create', () => {
        it('should create a new user with generated ID and temporary password from DNI', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user).toBeInstanceOf(UserEntity);
            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');
            expect(user.getEmail()).toBe('john.doe@example.com');
            expect(user.getDni()).toBe('12345678');
            expect(user.getPassword()).toBe('hashed_12345678');
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.isPasswordTemporary()).toBe(true);
            expect(user.getStatus()).toBe(UserStatus.ACTIVE);
        });

        it('should initialize basic properties correctly via getters', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();

            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getDni()).toBe('12345678');
            expect(user.getRole()).toBeDefined();
        });

        it('should fail with InvalidEmailError if email is invalid', async () => {
            const result = await UserEntity.create(
                makeUserProps({ email: 'not-an-email' }),
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });

        it('should fail with InvalidDniError if DNI is invalid', async () => {
            const result = await UserEntity.create(
                makeUserProps({ dni: 'invalid-dni' }),
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidDniError);
        });

        it('should fail with CannotAssignRoleError if role is not assignable', async () => {
            const inactiveRole = makeRoleReference({ status: 'INACTIVE' });

            const result = await UserEntity.create(
                { ...makeUserProps(), role: inactiveRole },
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(CannotAssignRoleError);
        });
    });

    describe('fromExisting', () => {
        it('should recreate a user keeping id and createdAt', () => {
            const createdAt = new Date('2024-01-01');
            const result = UserEntity.fromExisting(
                'existing-id-123',
                makeExistingUserProps(),
                createdAt
            );

            expect(result.isOk()).toBe(true);
            const user = result.value();

            expect(user.getId()).toBe('existing-id-123');
            expect(user.createdAt).toBe(createdAt);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.isPasswordTemporary()).toBe(false);
            expect(user.getStatus()).toBe(UserStatus.ACTIVE);
        });

        it('should fail with InvalidEmailError if email is invalid', () => {
            const result = UserEntity.fromExisting(
                'id',
                makeExistingUserProps({ email: 'invalid' }),
                new Date()
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
        });

        it('should fail with InvalidDniError if DNI is invalid', () => {
            const result = UserEntity.fromExisting(
                'id',
                makeExistingUserProps({ dni: 'invalid' }),
                new Date()
            );

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidDniError);
        });
    });

    describe('status management', () => {
        it('should activate an inactive user', () => {
            const user = makeUserEntity({ status: UserStatus.INACTIVE });
            const result = user.ensureCanActivate();

            expect(result.isOk()).toBe(true);
            user.activate();
            expect(user.getStatus()).toBe(UserStatus.ACTIVE);
        });

        it('should fail ensureCanActivate if user is already active', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });
            const result = user.ensureCanActivate();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserAlreadyActiveError);
        });

        it('should deactivate an active user', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });
            const result = user.ensureCanDeactivate();

            expect(result.isOk()).toBe(true);
            user.deactivate();
            expect(user.getStatus()).toBe(UserStatus.INACTIVE);
        });

        it('should fail ensureCanDeactivate if user is already inactive', () => {
            const user = makeUserEntity({ status: UserStatus.INACTIVE });
            const result = user.ensureCanDeactivate();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserAlreadyInactiveError);
        });

        it('should suspend an active user', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });
            const result = user.ensureCanSuspend();

            expect(result.isOk()).toBe(true);
            user.suspend();
            expect(user.getStatus()).toBe(UserStatus.SUSPENDED);
        });

        it('should fail ensureCanSuspend if user is already suspended', () => {
            const user = makeUserEntity({ status: UserStatus.SUSPENDED });
            const result = user.ensureCanSuspend();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserAlreadySuspendedError);
        });
    });

    describe('ensureDeletable', () => {
        it('should allow deletion if user is inactive', () => {
            const user = makeUserEntity({ status: UserStatus.INACTIVE });
            const result = user.ensureDeletable();

            expect(result.isOk()).toBe(true);
        });

        it('should fail if user is active', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });
            const result = user.ensureDeletable();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserNotDeletableError);
        });

        it('should fail if user is suspended', () => {
            const user = makeUserEntity({ status: UserStatus.SUSPENDED });
            const result = user.ensureDeletable();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserNotDeletableError);
        });
    });

    describe('ensureRoleAssignable', () => {
        it('should allow role assignment if user is active', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });
            const result = user.ensureRoleAssignable();

            expect(result.isOk()).toBe(true);
        });

        it('should fail if user is inactive', () => {
            const user = makeUserEntity({ status: UserStatus.INACTIVE });
            const result = user.ensureRoleAssignable();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserNotActiveError);
        });

        it('should fail if user is suspended', () => {
            const user = makeUserEntity({ status: UserStatus.SUSPENDED });
            const result = user.ensureRoleAssignable();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(UserNotActiveError);
        });
    });

    describe('isPasswordTemporary', () => {
        it('should return true when user has temporary password', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            expect(result.value().isPasswordTemporary()).toBe(true);
        });

        it('should return false when user has permanent password', () => {
            const user = makeUserEntity();
            expect(user.isPasswordTemporary()).toBe(false);
        });

        it('should return false after changing password', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();

            mockPasswordHasher.hash.mockResolvedValue('new_hashed');
            await user.changePassword('NewPassword123', mockPasswordHasher);

            expect(user.isPasswordTemporary()).toBe(false);
        });
    });

    describe('changePassword', () => {
        it('should update password and updatedAt when valid', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();
            const oldPassword = user.getPassword();

            mockPasswordHasher.hash.mockResolvedValue('new_hashed_pass');
            const changeResult = await user.changePassword('NewPassword123', mockPasswordHasher);

            expect(changeResult.isOk()).toBe(true);
            expect(user.getPassword()).toBe('new_hashed_pass');
            expect(user.getPassword()).not.toBe(oldPassword);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should update updatedAt on subsequent password changes', async () => {
            jest.useFakeTimers();
            const startTime = new Date('2024-01-01T00:00:00.000Z');
            jest.setSystemTime(startTime);

            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();

            await user.changePassword('FirstPassword123', mockPasswordHasher);
            const firstUpdatedAt = user.updatedAt;

            jest.advanceTimersByTime(1000);

            await user.changePassword('SecondPassword456', mockPasswordHasher);
            const secondUpdatedAt = user.updatedAt;

            expect(secondUpdatedAt?.getTime()).toBeGreaterThan(firstUpdatedAt?.getTime() ?? 0);

            jest.useRealTimers();
        });

        it('should fail with InvalidPasswordError when password is too weak', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();
            const oldPassword = user.getPassword();

            const changeResult = await user.changePassword('weak', mockPasswordHasher);

            expect(changeResult.isErr()).toBe(true);
            expect(changeResult.error()).toBeInstanceOf(InvalidPasswordError);
            expect(user.getPassword()).toBe(oldPassword);
        });

        it('should not update updatedAt when password change fails', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );
            const user = result.value();
            const initialUpdatedAt = user.updatedAt;

            await user.changePassword('invalid', mockPasswordHasher);

            expect(user.updatedAt).toBe(initialUpdatedAt);
        });
    });

    describe('updateProfile', () => {
        it('should update name and lastName', () => {
            const user = makeUserEntity();
            user.updateProfile({ name: 'Jane', lastName: 'Smith' });

            expect(user.getName()).toBe('Jane');
            expect(user.getLastName()).toBe('Smith');
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should update optional fields phone, address, photoUrl', () => {
            const user = makeUserEntity();
            user.updateProfile({
                phone: '999888777',
                address: 'Av. Lima 123',
                photoUrl: 'https://res.cloudinary.com/test/image.jpg'
            });

            expect(user.getPhone()).toBe('999888777');
            expect(user.getAddress()).toBe('Av. Lima 123');
            expect(user.getPhotoUrl()).toBe('https://res.cloudinary.com/test/image.jpg');
        });

        it('should not update updatedAt if no fields provided', () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            user.updateProfile({});

            expect(user.updatedAt).toBe(before);
        });
    });
});
