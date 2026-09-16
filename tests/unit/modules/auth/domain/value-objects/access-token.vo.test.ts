import { AccessTokenVO } from '@auth-domain/value-objects/access-token.vo';
import { InvalidAccessTokenError } from '@auth-domain/errors/invalid-access-token.error';

describe('AccessTokenVO', () => {
    it('should create a valid access token', () => {
        const result = AccessTokenVO.create('my-access-token');

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe('my-access-token');
    });

    it('should trim whitespace from token', () => {
        const result = AccessTokenVO.create('  my-token  ');

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe('my-token');
    });

    it('should fail with empty token', () => {
        const result = AccessTokenVO.create('');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidAccessTokenError);
    });

    it('should fail with whitespace-only token', () => {
        const result = AccessTokenVO.create('   ');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidAccessTokenError);
    });

    it('should be equal for same value', () => {
        const a = AccessTokenVO.create('token-123').value();
        const b = AccessTokenVO.create('token-123').value();

        expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different values', () => {
        const a = AccessTokenVO.create('token-123').value();
        const b = AccessTokenVO.create('token-456').value();

        expect(a.equals(b)).toBe(false);
    });
});
