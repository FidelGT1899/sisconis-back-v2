import { mock } from 'jest-mock-extended';

import { LogoutAllDevicesUseCase } from '@auth-application/use-cases/logout-all-devices.use-case';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';

describe('LogoutAllDevicesUseCase', () => {
    let useCase: LogoutAllDevicesUseCase;
    let mockSessionRepository: ReturnType<typeof mock<ISessionRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionRepository = mock<ISessionRepository>();
        useCase = new LogoutAllDevicesUseCase(mockSessionRepository);
    });

    it('should revoke all user sessions successfully', async () => {
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);

        const result = await useCase.execute({ userId: 'user-123' });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-123',
            'USER_REQUESTED'
        );
    });

    it('should propagate repository errors', async () => {
        mockSessionRepository.revokeAllByUserId.mockRejectedValue(new Error('Redis down'));

        await expect(
            useCase.execute({ userId: 'user-123' })
        ).rejects.toThrow('Redis down');
    });
});
