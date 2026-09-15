import { SessionEntity, SessionStatus } from '@auth-domain/entities/session.entity';
import { DeviceInfoVO } from '@auth-domain/value-objects/device-info.vo';
import { RefreshTokenHashVO } from '@auth-domain/value-objects/refresh-token-hash.vo';
import { SessionAlreadyRevokedError } from '@auth-domain/errors/session-already-revoked.error';
import { InactiveSessionError } from '@auth-domain/errors/inactive-session.error';
import { InvalidSessionExpirationError } from '@auth-domain/errors/invalid-session-expiration.error';

const makeDeviceInfo = (overrides = {}) =>
    DeviceInfoVO.create({
        deviceName: 'Chrome on Windows',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        ...overrides,
    }).value();

const makeHash = (value = 'a'.repeat(64)) =>
    RefreshTokenHashVO.create(value).value();

const now = new Date('2026-06-15T12:00:00.000Z');
const futureDate = new Date('2026-12-31T23:59:59.000Z');

const makeCreateParams = (overrides: Partial<{
    sessionId: string;
    userId: string;
    deviceInfo: DeviceInfoVO;
    refreshTokenHash: RefreshTokenHashVO;
    createdAt: Date;
    expiresAt: Date;
}> = {}) => ({
    sessionId: overrides.sessionId ?? 'session-123',
    userId: overrides.userId ?? 'user-123',
    deviceInfo: overrides.deviceInfo ?? makeDeviceInfo(),
    refreshTokenHash: overrides.refreshTokenHash ?? makeHash(),
    createdAt: overrides.createdAt ?? now,
    expiresAt: overrides.expiresAt ?? futureDate,
});

describe('SessionEntity', () => {
    describe('create', () => {
        it('should create a session successfully', () => {
            const result = SessionEntity.create(makeCreateParams());

            expect(result.isOk()).toBe(true);
            const session = result.value();
            expect(session.getSessionId()).toBe('session-123');
            expect(session.getUserId()).toBe('user-123');
            expect(session.isRevoked()).toBe(false);
            expect(session.getRevokedAt()).toBeNull();
        });

        it('should fail when expiresAt is before createdAt', () => {
            const result = SessionEntity.create(makeCreateParams({
                createdAt: new Date('2024-01-08'),
                expiresAt: new Date('2024-01-01'),
            }));

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidSessionExpirationError);
        });

        it('should fail when expiresAt equals createdAt', () => {
            const date = new Date('2024-01-01');
            const result = SessionEntity.create(makeCreateParams({
                createdAt: date,
                expiresAt: date,
            }));

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidSessionExpirationError);
        });
    });

    describe('rehydrate', () => {
        it('should rehydrate from primitives successfully', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const primitives = session.toPrimitives();

            const result = SessionEntity.rehydrate(primitives);

            expect(result.isOk()).toBe(true);
            const rehydrated = result.value();
            expect(rehydrated.getSessionId()).toBe(session.getSessionId());
            expect(rehydrated.getUserId()).toBe(session.getUserId());
        });

        it('should rehydrate with null previousRefreshTokenHash', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const primitives = session.toPrimitives();

            const result = SessionEntity.rehydrate(primitives);

            expect(result.isOk()).toBe(true);
        });

        it('should rehydrate preserving a previous refresh token hash', () => {
            const oldHash = makeHash('a'.repeat(64));
            const session = SessionEntity.create(makeCreateParams({ refreshTokenHash: oldHash })).value();
            const newHash = makeHash('b'.repeat(64));
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-20T12:00:00.000Z'));
            session.rotateRefreshToken(newHash);
            jest.useRealTimers();
            const primitives = session.toPrimitives();

            const result = SessionEntity.rehydrate(primitives);

            expect(result.isOk()).toBe(true);
            const rehydrated = result.value();
            expect(rehydrated.matchesRefreshTokenHash(newHash)).toBe(true);
            expect(rehydrated.matchesPreviousRefreshTokenHash(oldHash)).toBe(true);
        });

        it('should fail when device info is invalid', () => {
            const primitives = SessionEntity.create(makeCreateParams()).
                value().toPrimitives();
            primitives.deviceInfo = { deviceName: '', ip: '', userAgent: '' };

            const result = SessionEntity.rehydrate(primitives);

            expect(result.isErr()).toBe(true);
        });

        it('should fail when refresh token hash is invalid', () => {
            const primitives = SessionEntity.create(makeCreateParams()).
                value().toPrimitives();
            primitives.refreshTokenHash = '';

            const result = SessionEntity.rehydrate(primitives);

            expect(result.isErr()).toBe(true);
        });
    });

    describe('revoke', () => {
        it('should revoke an active session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();

            const result = session.revoke();

            expect(result.isOk()).toBe(true);
            expect(session.isRevoked()).toBe(true);
            expect(session.getRevokedAt()).toBeInstanceOf(Date);
        });

        it('should fail when session is already revoked', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            session.revoke();

            const result = session.revoke();

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(SessionAlreadyRevokedError);
        });
    });

    describe('rotateRefreshToken', () => {
        it('should rotate refresh token on active session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const newHash = makeHash('b'.repeat(64));
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-20T12:00:00.000Z'));

            const result = session.rotateRefreshToken(newHash);

            expect(result.isOk()).toBe(true);
            expect(session.matchesRefreshTokenHash(newHash)).toBe(true);
            jest.useRealTimers();
        });

        it('should move the previous hash for reuse detection after rotation', () => {
            const oldHash = makeHash('a'.repeat(64));
            const session = SessionEntity.create(makeCreateParams({ refreshTokenHash: oldHash })).value();
            const newHash = makeHash('b'.repeat(64));

            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-20T12:00:00.000Z'));
            session.rotateRefreshToken(newHash);
            jest.useRealTimers();

            expect(session.matchesRefreshTokenHash(oldHash)).toBe(false);
            expect(session.matchesPreviousRefreshTokenHash(oldHash)).toBe(true);
            expect(session.matchesPreviousRefreshTokenHash(newHash)).toBe(false);
        });

        it('should fail when session is inactive', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            session.revoke();

            const newHash = makeHash('b'.repeat(64));
            const result = session.rotateRefreshToken(newHash);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InactiveSessionError);
        });
    });

    describe('extendExpiration', () => {
        it('should extend expiration successfully', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const newExpiresAt = new Date('2027-06-30T23:59:59.000Z');
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2026-06-20T12:00:00.000Z'));

            const result = session.extendExpiration(newExpiresAt);

            expect(result.isOk()).toBe(true);
            expect(session.getExpiresAt()).toEqual(newExpiresAt);
            jest.useRealTimers();
        });

        it('should fail when newExpiresAt is in the past', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const pastDate = new Date('2020-01-01');

            const result = session.extendExpiration(pastDate);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidSessionExpirationError);
        });

        it('should fail when newExpiresAt is before the session creation date', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            const beforeCreation = new Date('2026-06-10T00:00:00.000Z');
            const at = new Date('2026-06-01T00:00:00.000Z');

            const result = session.extendExpiration(beforeCreation, at);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidSessionExpirationError);
        });
    });

    describe('getStatus', () => {
        it('should return ACTIVE for a valid session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();

            expect(session.getStatus()).toBe(SessionStatus.ACTIVE);
        });

        it('should return REVOKED for a revoked session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            session.revoke();

            expect(session.getStatus()).toBe(SessionStatus.REVOKED);
        });

        it('should return EXPIRED for an expired session', () => {
            const session = SessionEntity.create(makeCreateParams({
                createdAt: new Date('2020-01-01'),
                expiresAt: new Date('2020-01-02'),
            })).value();

            expect(session.getStatus()).toBe(SessionStatus.EXPIRED);
        });
    });

    describe('queries', () => {
        it('should return true for isActive on active session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            expect(session.isActive()).toBe(true);
        });

        it('should return false for isExpired on active session', () => {
            const session = SessionEntity.create(makeCreateParams()).value();
            expect(session.isExpired()).toBe(false);
        });

        it('should return true for isExpired on expired session', () => {
            const session = SessionEntity.create(makeCreateParams({
                createdAt: new Date('2020-01-01'),
                expiresAt: new Date('2020-01-02'),
            })).value();
            expect(session.isExpired()).toBe(true);
        });

        it('should return true for belongsTo with matching userId', () => {
            const session = SessionEntity.create(makeCreateParams({ userId: 'user-456' })).value();
            expect(session.belongsTo('user-456')).toBe(true);
        });

        it('should return false for belongsTo with different userId', () => {
            const session = SessionEntity.create(makeCreateParams({ userId: 'user-456' })).value();
            expect(session.belongsTo('other-user')).toBe(false);
        });

        it('should return true for matchesRefreshTokenHash with matching hash', () => {
            const hash = makeHash('a'.repeat(64));
            const session = SessionEntity.create(makeCreateParams({ refreshTokenHash: hash })).value();
            expect(session.matchesRefreshTokenHash(hash)).toBe(true);
        });

        it('should return false for matchesRefreshTokenHash with different hash', () => {
            const hash = makeHash('a'.repeat(64));
            const session = SessionEntity.create(makeCreateParams({ refreshTokenHash: hash })).value();
            const differentHash = makeHash('b'.repeat(64));
            expect(session.matchesRefreshTokenHash(differentHash)).toBe(false);
        });
    });

    describe('toPrimitives', () => {
        it('should serialize to primitives', () => {
            const session = SessionEntity.create(makeCreateParams({
                sessionId: 'sess-1',
                userId: 'user-1',
            })).value();

            const primitives = session.toPrimitives();

            expect(primitives.sessionId).toBe('sess-1');
            expect(primitives.userId).toBe('user-1');
            expect(primitives.previousRefreshTokenHash).toBeNull();
            expect(primitives.revokedAt).toBeNull();
            expect(primitives.deviceInfo).toHaveProperty('deviceName');
            expect(primitives.deviceInfo).toHaveProperty('ip');
            expect(primitives.deviceInfo).toHaveProperty('userAgent');
        });
    });
});
