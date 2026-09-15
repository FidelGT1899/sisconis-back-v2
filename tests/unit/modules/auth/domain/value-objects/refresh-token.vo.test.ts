import { RefreshTokenVO } from '@auth-domain/value-objects/refresh-token.vo';
import { InvalidRefreshTokenValueError } from '@auth-domain/errors/invalid-refresh-token-value.error';

describe('RefreshTokenVO', () => {
    it('should create a valid refresh token', () => {
        const raw = 'a'.repeat(64);
        const result = RefreshTokenVO.create(raw);

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe(raw);
    });

    it('should trim whitespace from token', () => {
        const raw = 'a'.repeat(64);
        const result = RefreshTokenVO.create(`  ${raw}  `);

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe(raw);
    });

    it('should fail with empty token', () => {
        const result = RefreshTokenVO.create('');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenValueError);
    });

    it('should fail with whitespace-only token', () => {
        const result = RefreshTokenVO.create('   ');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenValueError);
    });

    it('should fail with token shorter than 32 characters', () => {
        const result = RefreshTokenVO.create('a'.repeat(31));

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenValueError);
    });

    it('should accept token with exactly 32 characters', () => {
        const result = RefreshTokenVO.create('a'.repeat(32));

        expect(result.isOk()).toBe(true);
    });

    it('should be equal for same value', () => {
        const a = RefreshTokenVO.create('a'.repeat(64)).value();
        const b = RefreshTokenVO.create('a'.repeat(64)).value();

        expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different values', () => {
        const a = RefreshTokenVO.create('a'.repeat(64)).value();
        const b = RefreshTokenVO.create('b'.repeat(64)).value();

        expect(a.equals(b)).toBe(false);
    });
});
