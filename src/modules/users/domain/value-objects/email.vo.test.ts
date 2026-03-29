import { EmailVO } from './email.vo';
import { InvalidEmailError } from '../errors/invalid-email.error';
import { DniVO } from '@users-domain/value-objects/dni.vo';

describe('EmailVO', () => {
    it('should create a valid EmailVO instance', () => {
        const emailString = 'test@example.com';
        const result = EmailVO.create(emailString);

        expect(result.isOk()).toBe(true);
        const email = result.value();

        expect(email).toBeInstanceOf(EmailVO);
        expect(email.getValue()).toBe(emailString);
    });

    it('should return a fail Result with InvalidEmailError for an invalid email format', () => {
        const result = EmailVO.create('invalid-email');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidEmailError);
        expect(result.error().message).toMatch(/invalid-email/);
    });

    it('should be equal if the values are the same', () => {
        const email1 = EmailVO.create('user@domain.com').value();
        const email2 = EmailVO.create('user@domain.com').value();

        expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal if the values are different', () => {
        const email1 = EmailVO.create('user1@domain.com').value();
        const email2 = EmailVO.create('user2@domain.com').value();

        expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
        const email = EmailVO.create('test@domain.com').value();
        expect(email.equals(undefined)).toBe(false);
    });

    it('should return false when comparing with a different VO type', () => {
        const email = EmailVO.create('test@domain.com').value();
        const dni = DniVO.create('12345678').value();
        expect(email.equals(dni)).toBe(false);
    });

    it('should return true when comparing with itself', () => {
        const email = EmailVO.create('test@domain.com').value();
        expect(email.equals(email)).toBe(true);
    });

    it('should normalize email to lowercase and trim spaces', () => {
        const result = EmailVO.create('  TEST@Example.COM  ');

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe('test@example.com');
    });
});
