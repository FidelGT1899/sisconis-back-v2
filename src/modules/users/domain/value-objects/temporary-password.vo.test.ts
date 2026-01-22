import { DniVO } from "@users-domain/value-objects/dni.vo";
import { TemporaryPasswordVO } from "./temporary-password.vo";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

describe('TemporaryPasswordVO', () => {
    let mockHasher: IPasswordHasher;

    beforeEach(() => {
        mockHasher = {
            hash: jest.fn().mockImplementation((value: string) =>
                Promise.resolve(`hashed_${value}`)
            ),
            compare: jest.fn().mockResolvedValue(true)
        };
    });

    describe('fromDni', () => {
        it('should create a TemporaryPasswordVO from a DniVO', async () => {
            const dniValue = '12345678';
            const dniResult = DniVO.create(dniValue);

            expect(dniResult.isOk()).toBe(true);
            const dni = dniResult.value();

            const temporaryPassword = await TemporaryPasswordVO.fromDni(dni, mockHasher);

            expect(temporaryPassword).toBeInstanceOf(TemporaryPasswordVO);
            expect(temporaryPassword.getValue()).toBe(`hashed_${dniValue}`);
            expect(mockHasher.hash).toHaveBeenCalledWith(dniValue);
        });

        it('should create different instances from different DNIs', async () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('87654321').value();

            const tempPassword1 = await TemporaryPasswordVO.fromDni(dni1, mockHasher);
            const tempPassword2 = await TemporaryPasswordVO.fromDni(dni2, mockHasher);

            expect(tempPassword1.getValue()).toBe('hashed_12345678');
            expect(tempPassword2.getValue()).toBe('hashed_87654321');
            expect(tempPassword1.equals(tempPassword2)).toBe(false);
        });
    });

    describe('equality', () => {
        it('should be equal if created from DNIs with the same value', async () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('12345678').value();

            const tempPassword1 = await TemporaryPasswordVO.fromDni(dni1, mockHasher);
            const tempPassword2 = await TemporaryPasswordVO.fromDni(dni2, mockHasher);

            expect(tempPassword1.equals(tempPassword2)).toBe(true);
        });

        it('should not be equal if created from DNIs with different values', async () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('87654321').value();

            const tempPassword1 = await TemporaryPasswordVO.fromDni(dni1, mockHasher);
            const tempPassword2 = await TemporaryPasswordVO.fromDni(dni2, mockHasher);

            expect(tempPassword1.equals(tempPassword2)).toBe(false);
        });
    });

    describe('getValue', () => {
        it('should return the underlying DNI value', async () => {
            const dniValue = '12345678';
            const dni = DniVO.create(dniValue).value();
            const temporaryPassword = await TemporaryPasswordVO.fromDni(dni, mockHasher);

            expect(temporaryPassword.getValue()).toBe(`hashed_${dniValue}`);
        });
    });

    describe('matches', () => {
        it('should return true when passwords match', async () => {
            const hashedValue = 'hashed_12345678';
            const temporaryPassword = TemporaryPasswordVO.fromHashed(hashedValue);

            mockHasher.compare = jest.fn().mockResolvedValue(true);

            const matches = await temporaryPassword.matches('12345678', mockHasher);

            expect(matches).toBe(true);
            expect(mockHasher.compare).toHaveBeenCalledWith('12345678', hashedValue);
        });

        it('should return false when passwords do not match', async () => {
            const hashedValue = 'hashed_12345678';
            const temporaryPassword = TemporaryPasswordVO.fromHashed(hashedValue);

            mockHasher.compare = jest.fn().mockResolvedValue(false);

            const matches = await temporaryPassword.matches('wrongpassword', mockHasher);

            expect(matches).toBe(false);
        });
    });
});
