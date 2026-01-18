import { PasswordVO } from "./password.vo";
import { InvalidPasswordError } from "../errors/invalid-password.error";

describe('PasswordVO', () => {
    describe('create', () => {
        it('should create a valid PasswordVO instance', () => {
            const passwordString = 'Password123';
            const result = PasswordVO.create(passwordString);

            expect(result.isOk()).toBe(true);
            const password = result.value();

            expect(password).toBeInstanceOf(PasswordVO);
            expect(password.getValue()).toBe(passwordString);
        });

        it('should return a fail Result with InvalidPasswordError for an invalid password format', () => {
            const result = PasswordVO.create('invalid');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
        });

        it('should fail when password is too short', () => {
            const result = PasswordVO.create('Pass1');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
        });

        it('should fail when password has no letters', () => {
            const result = PasswordVO.create('12345678');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
        });

        it('should fail when password has no numbers', () => {
            const result = PasswordVO.create('Password');

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
        });
    });

    describe('fromHashed', () => {
        it('should create a PasswordVO from a hashed value', () => {
            const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz123456789';
            const password = PasswordVO.fromHashed(hashedPassword);

            expect(password).toBeInstanceOf(PasswordVO);
            expect(password.getValue()).toBe(hashedPassword);
        });
    });

    describe('equality', () => {
        it('should be equal if the values are the same', () => {
            const password1 = PasswordVO.create('Password123').value();
            const password2 = PasswordVO.create('Password123').value();

            expect(password1.equals(password2)).toBe(true);
        });

        it('should not be equal if the values are different', () => {
            const password1 = PasswordVO.create('Password123').value();
            const password2 = PasswordVO.create('Password456').value();

            expect(password1.equals(password2)).toBe(false);
        });

        it('should be equal when created from the same hash', () => {
            const hash = '$2b$10$hash123';
            const password1 = PasswordVO.fromHashed(hash);
            const password2 = PasswordVO.fromHashed(hash);

            expect(password1.equals(password2)).toBe(true);
        });
    });
});
