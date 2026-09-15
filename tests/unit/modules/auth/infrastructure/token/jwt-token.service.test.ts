import jwt from 'jsonwebtoken';

import { JwtTokenService } from '@auth-infrastructure/token/jwt-token.service';
import { TokenExpiredError } from '@auth-domain/errors/token-expired.error';
import { TokenVerificationFailedError } from '@auth-domain/errors/token-verification-failed.error';
import { AuthPolicy } from '@auth-domain/constants/auth-policy';

// tests/setup.ts inyecta JWT_SECRET en process.env antes de cargar los tests;
// no se mockea el config: si el secreto de setup cambiara, sign/verify seguirían
// siendo consistentes porque ambos lados usan el mismo proceso env.
const JWT_TEST_SECRET = process.env.JWT_SECRET as string;

describe('JwtTokenService', () => {
    let service: JwtTokenService;

    beforeEach(() => {
        service = new JwtTokenService();
    });

    describe('generateAccessToken', () => {
        it('should generate a valid JWT token', () => {
            const payload = {
                id: 'user-123',
                email: 'test@test.com',
                role: 'Admin',
                sessionId: 'session-123',
            };

            const token = service.generateAccessToken(payload);

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3);
        });

        it('should include correct payload and expiration', () => {
            const payload = {
                id: 'user-123',
                email: 'test@test.com',
                role: 'Admin',
                sessionId: 'session-123',
            };

            const token = service.generateAccessToken(payload);
            const decoded = jwt.decode(token) as Record<string, unknown>;

            expect(decoded.id).toBe('user-123');
            expect(decoded.email).toBe('test@test.com');
            expect(decoded.role).toBe('Admin');
            expect(decoded.sessionId).toBe('session-123');
            expect(decoded.exp).toBeDefined();
            // El access token debe expirar exactamente en ACCESS_TOKEN_TTL_SECONDS (900s).
            // Pin literal para detectar regresiones del TTL intencional.
            expect(Number(decoded.exp) - Number(decoded.iat)).toBe(900);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify a valid token successfully', () => {
            const payload = {
                id: 'user-123',
                email: 'test@test.com',
                role: 'Admin',
                sessionId: 'session-123',
            };

            const token = service.generateAccessToken(payload);
            const result = service.verifyAccessToken(token);

            expect(result.isOk()).toBe(true);
            expect(result.value().id).toBe('user-123');
            expect(result.value().email).toBe('test@test.com');
            expect(result.value().role).toBe('Admin');
            expect(result.value().sessionId).toBe('session-123');
        });

        it('should return TokenExpiredError for expired token', () => {
            const payload = {
                id: 'user-123',
                email: 'test@test.com',
                role: 'Admin',
                sessionId: 'session-123',
            };

            const token = jwt.sign(
                payload,
                JWT_TEST_SECRET,
                { expiresIn: -10 }
            );

            const result = service.verifyAccessToken(token);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(TokenExpiredError);
        });

        it('should return TokenVerificationFailedError for invalid token', () => {
            const result = service.verifyAccessToken('invalid-token');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(TokenVerificationFailedError);
        });

        it('should return TokenVerificationFailedError for token signed with wrong secret', () => {
            const payload = {
                id: 'user-123',
                email: 'test@test.com',
                role: 'Admin',
                sessionId: 'session-123',
            };

            const token = jwt.sign(payload, 'wrong-secret-key-with-at-least-32-chars!!!');

            const result = service.verifyAccessToken(token);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(TokenVerificationFailedError);
        });

        it('should return TokenVerificationFailedError when payload is missing required fields', () => {
            const token = jwt.sign(
                { id: 'user-123' },
                JWT_TEST_SECRET,
                { expiresIn: AuthPolicy.ACCESS_TOKEN_TTL_SECONDS }
            );

            const result = service.verifyAccessToken(token);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(TokenVerificationFailedError);
        });
    });
});
