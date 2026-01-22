import { PasswordVO } from "./password.vo";
import { InvalidPasswordError } from "../errors/invalid-password.error";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

describe('PasswordVO', () => {
    let mockHasher: IPasswordHasher;

    beforeEach(() => {
        mockHasher = {
            hash: jest.fn().mockImplementation((value: string) =>
                Promise.resolve(`hashed_${value}`)
            ),
            compare: jest.fn().mockResolvedValue(true)
        };
    });

    describe('create', () => {
        it('should create a valid PasswordVO instance', async () => {
            const passwordString = 'Password123';
            const result = await PasswordVO.create(passwordString, mockHasher);

            expect(result.isOk()).toBe(true);
            const password = result.value();

            expect(password).toBeInstanceOf(PasswordVO);
            expect(password.getValue()).toBe(`hashed_${passwordString}`);
            expect(mockHasher.hash).toHaveBeenCalledWith(passwordString);
        });

        it('should return a fail Result with InvalidPasswordError for an invalid password format', async () => {
            const result = await PasswordVO.create('invalid', mockHasher);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
            expect(mockHasher.hash).not.toHaveBeenCalled();
        });

        it('should fail when password is too short', async () => {
            const result = await PasswordVO.create('Pass1', mockHasher);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
            expect(mockHasher.hash).not.toHaveBeenCalled();
        });

        it('should fail when password has no letters', async () => {
            const result = await PasswordVO.create('12345678', mockHasher);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
            expect(mockHasher.hash).not.toHaveBeenCalled();
        });

        it('should fail when password has no numbers', async () => {
            const result = await PasswordVO.create('Password', mockHasher);

            expect(result.isErr()).toBe(true);
            expect(result.error()).toBeInstanceOf(InvalidPasswordError);
            expect(mockHasher.hash).not.toHaveBeenCalled();
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
        it('should be equal if the values are the same', async () => {
            const result1 = await PasswordVO.create('Password123', mockHasher);
            const result2 = await PasswordVO.create('Password123', mockHasher);

            const password1 = result1.value();
            const password2 = result2.value();

            expect(password1.equals(password2)).toBe(true);
        });

        it('should not be equal if the values are different', async () => {
            const result1 = await PasswordVO.create('Password123', mockHasher);
            const result2 = await PasswordVO.create('Password456', mockHasher);

            const password1 = result1.value();
            const password2 = result2.value();

            expect(password1.equals(password2)).toBe(false);
        });

        it('should be equal when created from the same hash', () => {
            const hash = '$2b$10$hash123';
            const password1 = PasswordVO.fromHashed(hash);
            const password2 = PasswordVO.fromHashed(hash);

            expect(password1.equals(password2)).toBe(true);
        });
    });

    describe('matches', () => {
        it('should return true when plain password matches hashed password', async () => {
            const hashedPassword = '$2b$10$someHash';
            const password = PasswordVO.fromHashed(hashedPassword);

            mockHasher.compare = jest.fn().mockResolvedValue(true);

            const matches = await password.matches('Password123', mockHasher);

            expect(matches).toBe(true);
            expect(mockHasher.compare).toHaveBeenCalledWith('Password123', hashedPassword);
        });

        it('should return false when plain password does not match', async () => {
            const hashedPassword = '$2b$10$someHash';
            const password = PasswordVO.fromHashed(hashedPassword);

            mockHasher.compare = jest.fn().mockResolvedValue(false);

            const matches = await password.matches('WrongPassword', mockHasher);

            expect(matches).toBe(false);
            expect(mockHasher.compare).toHaveBeenCalledWith('WrongPassword', hashedPassword);
        });
    });
});
