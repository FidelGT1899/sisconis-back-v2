import { mock } from 'jest-mock-extended';

import { LogoutBySecurityEventUseCase } from '@auth-application/use-cases/logout-by-security-event.use-case';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';

describe('LogoutBySecurityEventUseCase', () => {
    let useCase: LogoutBySecurityEventUseCase;
    let mockSessionRepository: ReturnType<typeof mock<ISessionRepository>>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionRepository = mock<ISessionRepository>();
        useCase = new LogoutBySecurityEventUseCase(mockSessionRepository);
    });

    it('should revoke all sessions for a security event', async () => {
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-123',
            reason: 'PASSWORD_CHANGED',
        });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-123',
            'PASSWORD_CHANGED'
        );
    });

    it('should work with SUSPENDED reason', async () => {
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-456',
            reason: 'SUSPENDED',
        });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-456',
            'SUSPENDED'
        );
    });

    it('should work with ROLE_CHANGED reason', async () => {
        mockSessionRepository.revokeAllByUserId.mockResolvedValue(undefined);

        const result = await useCase.execute({
            userId: 'user-789',
            reason: 'ROLE_CHANGED',
        });

        expect(result.isOk()).toBe(true);
        expect(mockSessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            'user-789',
            'ROLE_CHANGED'
        );
    });

    it('should propagate repository errors', async () => {
        mockSessionRepository.revokeAllByUserId.mockRejectedValue(new Error('Redis down'));

        await expect(
            useCase.execute({ userId: 'user-123', reason: 'DISABLED' })
        ).rejects.toThrow('Redis down');
    });
});
