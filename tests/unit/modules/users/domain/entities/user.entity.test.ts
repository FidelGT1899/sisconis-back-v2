import { UserEntity, UserStatus } from "@users-domain/entities/user.entity";
import { InvalidEmailError } from "@users-domain/errors/invalid-email.error";
import { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { InvalidDniError } from "@users-domain/errors/invalid-dni.error";
import { EmailVO } from "@users-domain/value-objects/email.vo";
import { DniVO } from "@users-domain/value-objects/dni.vo";
import { PasswordFactory } from "@users-domain/factories/password.factory";
import { makeMockIdGenerator, makeMockPasswordHasher } from "@tests-factories/users/mocks";
import { makeExistingUserProps, makeUserEntity, makeUserProps } from "@tests-factories/users/user.factory";
import { makeRoleReference } from "@tests-factories/users/role.factory";
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

        it('should create user successfully regardless of role status override (RoleReferenceVO has no status field)', async () => {
            // RoleReferenceVO only carries { id, name, level } — no status.
            // UserEntity.create does not validate role status at creation time.
            // The 'status' override is silently ignored by makeRoleReference.
            const roleRef = makeRoleReference({ id: 'some-role-id', level: 5 });

            const result = await UserEntity.create(
                { ...makeUserProps(), role: roleRef },
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.isOk()).toBe(true);
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

    describe('requiresPasswordChange', () => {
        it('should return true when password is temporary', async () => {
            const result = await UserEntity.create(
                makeUserProps(),
                mockIdGenerator,
                mockPasswordHasher
            );

            expect(result.value().requiresPasswordChange()).toBe(true);
        });

        it('should return false when password is permanent', () => {
            const user = makeUserEntity();

            expect(user.requiresPasswordChange()).toBe(false);
        });
    });

    describe('changeRole', () => {
        it('should update role and updatedAt when role changes', () => {
            const user = makeUserEntity();
            const newRole = makeRoleReference({ id: 'role-id-456', level: 3 });
            const before = user.updatedAt;

            user.changeRole(newRole);

            expect(user.getRoleId()).toBe('role-id-456');
            expect(user.updatedAt).not.toBe(before);
        });

        it('should not update updatedAt when role is the same', () => {
            const user = makeUserEntity();
            const sameRole = makeRoleReference({ id: user.getRoleId(), level: user.getRoleLevel() });
            const before = user.updatedAt;

            user.changeRole(sameRole);

            expect(user.getRoleId()).toBe(sameRole.getId());
            expect(user.updatedAt).toBe(before);
        });
    });

    describe('role management permissions', () => {
        it('should allow the actor to manage a target user of lower level', () => {
            const actor = makeUserEntity({ roleLevel: 7 });
            const target = makeUserEntity({ roleLevel: 3 });

            expect(actor.canManageUser(target)).toBe(true);
            expect(actor.canAssignRoleLevel(3)).toBe(true);
        });

        it('should not allow the actor to manage a target user of equal or higher level', () => {
            const actor = makeUserEntity({ roleLevel: 7 });
            const equal = makeUserEntity({ roleLevel: 7 });
            const higher = makeUserEntity({ roleLevel: 9 });

            expect(actor.canManageUser(equal)).toBe(false);
            expect(actor.canManageUser(higher)).toBe(false);
            expect(actor.canAssignRoleLevel(7)).toBe(false);
            expect(actor.canAssignRoleLevel(9)).toBe(false);
        });
    });

    describe('updateEmail', () => {
        it('should update email and updatedAt when valid', () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            const result = user.updateEmail('new.address@example.com');

            expect(result.isOk()).toBe(true);
            expect(user.getEmail()).toBe('new.address@example.com');
            expect(user.updatedAt).not.toBe(before);
        });

        it('should fail with InvalidEmailError and not mutate when invalid', () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            const result = user.updateEmail('invalid');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidEmailError);
            expect(user.getEmail()).toBe('john.doe@example.com');
            expect(user.updatedAt).toBe(before);
        });
    });

    describe('updateDni', () => {
        it('should update dni and updatedAt when valid', () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            const result = user.updateDni('87654321');

            expect(result.isOk()).toBe(true);
            expect(user.getDni()).toBe('87654321');
            expect(user.updatedAt).not.toBe(before);
        });

        it('should fail with InvalidDniError and not mutate when invalid', () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            const result = user.updateDni('bad-dni');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidDniError);
            expect(user.getDni()).toBe('12345678');
            expect(user.updatedAt).toBe(before);
        });
    });

    describe('resetToTemporaryPassword', () => {
        it('should rehash the DNI as a temporary password and update updatedAt', async () => {
            const user = makeUserEntity();
            const before = user.updatedAt;

            mockPasswordHasher.hash.mockResolvedValue('temp_hash_12345678');
            await user.resetToTemporaryPassword(mockPasswordHasher);

            expect(mockPasswordHasher.hash).toHaveBeenCalledWith('12345678');
            expect(user.getPassword()).toBe('temp_hash_12345678');
            expect(user.isPasswordTemporary()).toBe(true);
            expect(user.requiresPasswordChange()).toBe(true);
            expect(user.updatedAt).not.toBe(before);
        });
    });

    describe('verifyPassword', () => {
        it('should delegate to the password VO matches and return true on match', async () => {
            const user = makeUserEntity();
            mockPasswordHasher.compare.mockResolvedValue(true);

            await expect(user.verifyPassword('PlainPassword123', mockPasswordHasher)).resolves.toBe(true);
            expect(mockPasswordHasher.compare).toHaveBeenCalled();
        });

        it('should return false when compare fails', async () => {
            const user = makeUserEntity();
            mockPasswordHasher.compare.mockResolvedValue(false);

            await expect(user.verifyPassword('WrongPassword', mockPasswordHasher)).resolves.toBe(false);
        });
    });

    describe('status predicates', () => {
        it('should expose isActive, isInactive and isSuspended based on current status', () => {
            const active = makeUserEntity({ status: UserStatus.ACTIVE });
            const inactive = makeUserEntity({ status: UserStatus.INACTIVE });
            const suspended = makeUserEntity({ status: UserStatus.SUSPENDED });

            expect(active.isActive()).toBe(true);
            expect(active.isInactive()).toBe(false);
            expect(active.isSuspended()).toBe(false);

            expect(inactive.isActive()).toBe(false);
            expect(inactive.isInactive()).toBe(true);

            expect(suspended.isActive()).toBe(false);
            expect(suspended.isSuspended()).toBe(true);
        });
    });

    describe('ensureCanLogin', () => {
        it('should allow login when user is active', () => {
            const user = makeUserEntity({ status: UserStatus.ACTIVE });

            const result = user.ensureCanLogin();

            expect(result.isOk()).toBe(true);
        });

        it('should fail when user is inactive or suspended', () => {
            const inactive = makeUserEntity({ status: UserStatus.INACTIVE });
            const suspended = makeUserEntity({ status: UserStatus.SUSPENDED });

            expect(inactive.ensureCanLogin().isErr()).toBe(true);
            expect(inactive.ensureCanLogin().error()).toBeInstanceOf(UserNotActiveError);
            expect(suspended.ensureCanLogin().isErr()).toBe(true);
        });
    });

    describe('rehydrate', () => {
        it('should build an entity without validation preserving props', () => {
            const user = UserEntity.rehydrate({
                id: 'rehydrated-id',
                name: 'Ana',
                lastName: 'Gomez',
                email: EmailVO.create('ana@example.com').value(),
                dni: DniVO.create('87654321').value(),
                password: PasswordFactory.rehydratePermanent('some-hash'),
                role: makeRoleReference({ id: 'role-rehydrate-1', level: 5 }),
                status: UserStatus.ACTIVE,
                createdAt: new Date('2024-05-01'),
            });

            expect(user).toBeInstanceOf(UserEntity);
            expect(user.getId()).toBe('rehydrated-id');
            expect(user.getName()).toBe('Ana');
            expect(user.getRoleLevel()).toBe(5);
        });
    });
});
