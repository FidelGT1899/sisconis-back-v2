import { UpdateUserRoleUseCase } from "./update-user-role.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { RoleNotFoundError } from "../../errors/role/role-not-found.error";
import { UnauthorizedRoleAssignmentError } from "../../errors/unauthorized-role-assignment.error";
import { CannotModifyOwnRoleError } from "../../errors/cannot-modify-own-role.error";
import { UserNotActiveError } from "@users-domain/errors/user-not-active.error";
import { UserStatus } from "@users-domain/entities/user.entity";

import { makeMockUserRepository, makeMockRoleRepository } from "@users-tests/factories/mocks";
import { makeUserEntity } from "@users-tests/factories/user.factory";
import { makeRoleEntity } from "@users-tests/factories/role.factory";

describe('UpdateUserRoleUseCase', () => {
    let useCase: UpdateUserRoleUseCase;
    let mockUserRepository: ReturnType<typeof makeMockUserRepository>;
    let mockRoleRepository: ReturnType<typeof makeMockRoleRepository>;

    const dto = {
        executorId: 'executor-id',
        userId: 'user-id-123',
        newRoleId: 'new-role-id'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUserRepository = makeMockUserRepository();
        mockRoleRepository = makeMockRoleRepository();
        useCase = new UpdateUserRoleUseCase(mockUserRepository, mockRoleRepository);
    });

    it('should update user role successfully when executor has higher role level', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 10 });
        const userToUpdate = makeUserEntity({ id: 'user-id-123', roleLevel: 5 });
        const newRole = makeRoleEntity({ id: 'new-role-id', level: 6 });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            if (id === 'user-id-123') return Promise.resolve(userToUpdate);
            return Promise.resolve(null);
        });
        mockRoleRepository.findById.mockResolvedValue(newRole);
        mockUserRepository.update.mockResolvedValue(userToUpdate);

        const result = await useCase.execute(dto);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
        expect(userToUpdate.getRoleId()).toBe('new-role-id');
    });

    it('should fail with CannotModifyOwnRoleError if executor tries to modify their own role', async () => {
        const selfDto = {
            executorId: 'user-id-123',
            userId: 'user-id-123',
            newRoleId: 'new-role-id'
        };

        const result = await useCase.execute(selfDto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(CannotModifyOwnRoleError);
        expect(mockUserRepository.findById).not.toHaveBeenCalled();
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotFoundError if executor does not exist', async () => {
        mockUserRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotFoundError if user to update does not exist', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 10 });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            return Promise.resolve(null);
        });

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UnauthorizedRoleAssignmentError if executor role level is not greater than target user', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 5 });
        const userToUpdate = makeUserEntity({ id: 'user-id-123', roleLevel: 7 });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            if (id === 'user-id-123') return Promise.resolve(userToUpdate);
            return Promise.resolve(null);
        });

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UnauthorizedRoleAssignmentError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotActiveError if user to update is not active', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 10 });
        const userToUpdate = makeUserEntity({ id: 'user-id-123', roleLevel: 5, status: UserStatus.INACTIVE });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            if (id === 'user-id-123') return Promise.resolve(userToUpdate);
            return Promise.resolve(null);
        });

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotActiveError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with RoleNotFoundError if new role does not exist', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 10 });
        const userToUpdate = makeUserEntity({ id: 'user-id-123', roleLevel: 5 });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            if (id === 'user-id-123') return Promise.resolve(userToUpdate);
            return Promise.resolve(null);
        });
        mockRoleRepository.findById.mockResolvedValue(null);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RoleNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UnauthorizedRoleAssignmentError if executor cannot assign the new role level', async () => {
        const executor = makeUserEntity({ id: 'executor-id', roleLevel: 7 });
        const userToUpdate = makeUserEntity({ id: 'user-id-123', roleLevel: 5 });
        const highLevelRole = makeRoleEntity({ id: 'new-role-id', level: 8 });

        mockUserRepository.findById.mockImplementation((id: string) => {
            if (id === 'executor-id') return Promise.resolve(executor);
            if (id === 'user-id-123') return Promise.resolve(userToUpdate);
            return Promise.resolve(null);
        });
        mockRoleRepository.findById.mockResolvedValue(highLevelRole);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UnauthorizedRoleAssignmentError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
