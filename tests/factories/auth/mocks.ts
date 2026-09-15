import { mock } from 'jest-mock-extended';
import type { ISessionRepository } from '@auth-domain/repositories/session.repository.interface';
import type { ITokenService } from '@auth-domain/ports/token.service.interface';
import type { ITokenGenerator } from '@auth-domain/ports/token-generator.interface';
import type { IRateLimiter } from '@auth-domain/ports/rate-limiter.interface';
import type { IDeviceInfoParser } from '@auth-domain/ports/device-info-parser.interface';
import type { IAccessTokenBlacklist } from '@auth-domain/ports/access-token-blacklist.interface';
import type { IHashService } from '@shared-domain/ports/hash-service';

export const makeMockSessionRepository = () => mock<ISessionRepository>();
export const makeMockTokenService = () => mock<ITokenService>();
export const makeMockTokenGenerator = () => {
    const m = mock<ITokenGenerator>();
    m.generate.mockReturnValue('a'.repeat(64));
    return m;
};
export const makeMockRateLimiter = () => {
    const m = mock<IRateLimiter>();
    m.checkLimit.mockResolvedValue({
        isBlocked: false,
        remainingAttempts: 5,
        retryAfterSeconds: null,
    });
    return m;
};
export const makeMockDeviceInfoParser = () => {
    const m = mock<IDeviceInfoParser>();
    m.parse.mockReturnValue('Test Device');
    return m;
};
export const makeMockAccessTokenBlacklist = () => mock<IAccessTokenBlacklist>();
export const makeMockHashService = () => {
    const m = mock<IHashService>();
    m.hash.mockReturnValue('hashed-value');
    return m;
};
