import { RefreshTokenHashVO } from '@auth-domain/value-objects/refresh-token-hash.vo';
import { InvalidRefreshTokenHashError } from '@auth-domain/errors/invalid-refresh-token-hash.error';

describe('RefreshTokenHashVO', () => {
    it('should create a valid refresh token hash', () => {
        const result = RefreshTokenHashVO.create('hashed-value-123');

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe('hashed-value-123');
    });

    it('should fail with empty string', () => {
        const result = RefreshTokenHashVO.create('');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenHashError);
    });

    it('should fail with whitespace-only string', () => {
        const result = RefreshTokenHashVO.create('   ');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidRefreshTokenHashError);
    });

    it('should be equal for same value', () => {
        const a = RefreshTokenHashVO.create('hash-abc').value();
        const b = RefreshTokenHashVO.create('hash-abc').value();

        expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different values', () => {
        const a = RefreshTokenHashVO.create('hash-abc').value();
        const b = RefreshTokenHashVO.create('hash-def').value();

        expect(a.equals(b)).toBe(false);
    });
});
