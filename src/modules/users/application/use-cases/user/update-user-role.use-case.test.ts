import { UpdateUserRoleUseCase } from "./update-user-role.use-case";
import { UserNotFoundError } from "../../errors/user-not-found.error";
import { RoleNotFoundError } from "../../errors/role/role-not-found.error";
import { UnauthorizedRoleAssignmentError } from "../../errors/unauthorized-role-assignment.error";
import { UserNotActiveError } from "@users-domain/errors/user-not-active.error";
import { UserStatus } from "@users-domain/entities/user.entity";
import { RoleStatus } from "@users-domain/entities/role.entity";

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

    it('should update user role successfully', async () => {
        const executor = makeUserEntity();
        const userToUpdate = makeUserEntity();
        const executorRole = makeRoleEntity({ level: 7 });
        const newRole = makeRoleEntity({ id: 'new-role-id' });

        mockUserRepository.findById
            .mockResolvedValueOnce(executor)
            .mockResolvedValueOnce(userToUpdate);
        mockRoleRepository.findById
            .mockResolvedValueOnce(executorRole)
            .mockResolvedValueOnce(newRole);
        mockUserRepository.update.mockResolvedValue(userToUpdate);

        const result = await useCase.execute(dto);

        expect(result.isOk()).toBe(true);
        expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should fail with UserNotFoundError if executor does not exist', async () => {
        mockUserRepository.findById.mockResolvedValueOnce(null);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UnauthorizedRoleAssignmentError if executor role level is below 7', async () => {
        const executor = makeUserEntity();
        const executorRole = makeRoleEntity({ level: 5 });

        mockUserRepository.findById.mockResolvedValueOnce(executor);
        mockRoleRepository.findById.mockResolvedValueOnce(executorRole);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UnauthorizedRoleAssignmentError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotFoundError if user to update does not exist', async () => {
        const executor = makeUserEntity();
        const executorRole = makeRoleEntity({ level: 7 });

        mockUserRepository.findById
            .mockResolvedValueOnce(executor)
            .mockResolvedValueOnce(null);
        mockRoleRepository.findById.mockResolvedValueOnce(executorRole);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with UserNotActiveError if user to update is not active', async () => {
        const executor = makeUserEntity();
        const userToUpdate = makeUserEntity({ status: UserStatus.INACTIVE });
        const executorRole = makeRoleEntity({ level: 7 });

        mockUserRepository.findById
            .mockResolvedValueOnce(executor)
            .mockResolvedValueOnce(userToUpdate);
        mockRoleRepository.findById.mockResolvedValueOnce(executorRole);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(UserNotActiveError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail with RoleNotFoundError if new role does not exist', async () => {
        const executor = makeUserEntity();
        const userToUpdate = makeUserEntity();
        const executorRole = makeRoleEntity({ level: 7 });

        mockUserRepository.findById
            .mockResolvedValueOnce(executor)
            .mockResolvedValueOnce(userToUpdate);
        mockRoleRepository.findById
            .mockResolvedValueOnce(executorRole)
            .mockResolvedValueOnce(null);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(RoleNotFoundError);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should fail if new role is not active', async () => {
        const executor = makeUserEntity();
        const userToUpdate = makeUserEntity();
        const executorRole = makeRoleEntity({ level: 7 });
        const inactiveRole = makeRoleEntity({ id: 'new-role-id', status: RoleStatus.INACTIVE });

        mockUserRepository.findById
            .mockResolvedValueOnce(executor)
            .mockResolvedValueOnce(userToUpdate);
        mockRoleRepository.findById
            .mockResolvedValueOnce(executorRole)
            .mockResolvedValueOnce(inactiveRole);

        const result = await useCase.execute(dto);

        expect(result.isErr()).toBe(true);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
});
