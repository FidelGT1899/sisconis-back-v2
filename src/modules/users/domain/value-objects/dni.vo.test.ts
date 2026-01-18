import { DniVO } from "./dni.vo";
import { InvalidDniError } from "../errors/invalid-dni.error";

describe('DniVO', () => {
    it('should create a valid DniVO instance', () => {
        const dniString = '12345678';
        const result = DniVO.create(dniString);

        expect(result.isOk()).toBe(true);
        const dni = result.value();

        expect(dni).toBeInstanceOf(DniVO);
        expect(dni.getValue()).toBe(dniString);
    });

    it('should return a fail Result with InvalidDniError for an invalid dni format', () => {
        const result = DniVO.create('invalid-dni');

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDniError);
        expect(result.error().message).toMatch(/invalid-dni/);
    });

    it('should be equal if the values are the same', () => {
        const dni1 = DniVO.create('12345678').value();
        const dni2 = DniVO.create('12345678').value();

        expect(dni1.equals(dni2)).toBe(true);
    });

    it('should not be equal if the values are different', () => {
        const dni1 = DniVO.create('12345678').value();
        const dni2 = DniVO.create('12345679').value();

        expect(dni1.equals(dni2)).toBe(false);
    });

    it('should return false when comparing with a non-DniVO object', () => {
        const dni = DniVO.create('12345678').value();

        expect(dni.equals("hola" as unknown)).toBe(false);
        expect(dni.equals(123 as unknown)).toBe(false);
        expect(dni.equals({ value: '12345678' } as unknown)).toBe(false);
    });

    it('should normalize dni to lowercase and trim spaces', () => {
        const result = DniVO.create('  12345678  ');

        expect(result.isOk()).toBe(true);
        expect(result.value().getValue()).toBe('12345678');
    });
});
