import { CryptoTokenGenerator } from '@auth-infrastructure/token/crypto-token-generator';

describe('CryptoTokenGenerator', () => {
    let generator: CryptoTokenGenerator;

    beforeEach(() => {
        generator = new CryptoTokenGenerator();
    });

    it('should generate a hex string', () => {
        const token = generator.generate();

        expect(typeof token).toBe('string');
        expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });

    it('should generate a token of 128 hex characters (64 bytes)', () => {
        const token = generator.generate();

        expect(token).toHaveLength(128);
    });

    it('should generate unique tokens on each call', () => {
        const token1 = generator.generate();
        const token2 = generator.generate();

        expect(token1).not.toBe(token2);
    });
});
