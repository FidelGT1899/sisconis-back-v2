import { EmailVO } from './email.vo';
import { InvalidEmailError } from '../errors/invalid-email.error';

describe('EmailVO', () => {
    it('should create a valid EmailVO instance', () => {
        const emailString = 'test@example.com';
        const email = EmailVO.create(emailString);

        expect(email).toBeInstanceOf(EmailVO);
        expect(email.getValue()).toBe(emailString);
    });

    it('should throw InvalidEmailError for an invalid email format', () => {
        expect(() => EmailVO.create('invalid-email')).toThrow(InvalidEmailError);
        expect(() => EmailVO.create('invalid-email')).toThrow(/invalid-email/);
    });

    it('should be equal if the values are the same', () => {
        const email1 = EmailVO.create('user@domain.com');
        const email2 = EmailVO.create('user@domain.com');

        expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal if the values are different', () => {
        const email1 = EmailVO.create('user1@domain.com');
        const email2 = EmailVO.create('user2@domain.com');

        expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with a non-EmailVO object', () => {
        const email = EmailVO.create('test@domain.com');

        expect(email.equals("hola" as unknown)).toBe(false);
        expect(email.equals(123 as unknown)).toBe(false);
        expect(email.equals({ value: 'test@domain.com' } as unknown)).toBe(false);
    });
});