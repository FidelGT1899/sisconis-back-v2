import { DniVO } from "@users-domain/value-objects/dni.vo";
import { TemporaryPasswordVO } from "./temporary-password.vo";

describe('TemporaryPasswordVO', () => {
    describe('fromDni', () => {
        it('should create a TemporaryPasswordVO from a DniVO', () => {
            const dniValue = '12345678';
            const dniResult = DniVO.create(dniValue);

            expect(dniResult.isOk()).toBe(true);
            const dni = dniResult.value();

            const temporaryPassword = TemporaryPasswordVO.fromDni(dni);

            expect(temporaryPassword).toBeInstanceOf(TemporaryPasswordVO);
            expect(temporaryPassword.getValue()).toBe(dniValue);
        });

        it('should create different instances from different DNIs', () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('87654321').value();

            const tempPassword1 = TemporaryPasswordVO.fromDni(dni1);
            const tempPassword2 = TemporaryPasswordVO.fromDni(dni2);

            expect(tempPassword1.getValue()).toBe('12345678');
            expect(tempPassword2.getValue()).toBe('87654321');
            expect(tempPassword1.equals(tempPassword2)).toBe(false);
        });
    });

    describe('equality', () => {
        it('should be equal if created from DNIs with the same value', () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('12345678').value();

            const tempPassword1 = TemporaryPasswordVO.fromDni(dni1);
            const tempPassword2 = TemporaryPasswordVO.fromDni(dni2);

            expect(tempPassword1.equals(tempPassword2)).toBe(true);
        });

        it('should not be equal if created from DNIs with different values', () => {
            const dni1 = DniVO.create('12345678').value();
            const dni2 = DniVO.create('87654321').value();

            const tempPassword1 = TemporaryPasswordVO.fromDni(dni1);
            const tempPassword2 = TemporaryPasswordVO.fromDni(dni2);

            expect(tempPassword1.equals(tempPassword2)).toBe(false);
        });
    });

    describe('getValue', () => {
        it('should return the underlying DNI value', () => {
            const dniValue = '12345678';
            const dni = DniVO.create(dniValue).value();
            const temporaryPassword = TemporaryPasswordVO.fromDni(dni);

            expect(temporaryPassword.getValue()).toBe(dniValue);
        });
    });
});
