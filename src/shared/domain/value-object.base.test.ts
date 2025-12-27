import { ValueObjectBase } from "./value-object.base";

class StringVO extends ValueObjectBase {
    constructor(private readonly value: string) {
        super();
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.value];
    }

    public getValue(): string {
        return this.value;
    }
}

class ComplexVO extends ValueObjectBase {
    constructor(private readonly props: { id: number; name: string }) {
        super();
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.props.id, this.props.name];
    }

    public getValue() {
        return this.props;
    }
}

describe('ValueObjectBase', () => {
    it('should return true when two string VOs have the same value', () => {
        const vo1 = new StringVO('test');
        const vo2 = new StringVO('test');

        expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false when compared with null or undefined', () => {
        const vo = new StringVO('test');

        expect(vo.equals(undefined)).toBe(false);
        expect(vo.equals(null as unknown as ValueObjectBase)).toBe(false);
    });

    it('should return true for complex VOs with same components', () => {
        const vo1 = new ComplexVO({ id: 1, name: 'John' });
        const vo2 = new ComplexVO({ id: 1, name: 'John' });

        expect(vo1.equals(vo2)).toBe(true);
    });

    it('should return false for complex VOs with different components', () => {
        const vo1 = new ComplexVO({ id: 1, name: 'John' });
        const vo2 = new ComplexVO({ id: 1, name: 'Doe' });

        expect(vo1.equals(vo2)).toBe(false);
    });

    it('should return false for different ValueObject types with same values', () => {
        const vo1 = new StringVO('test');
        const vo2 = new ComplexVO({ id: 0, name: 'test' });

        expect(vo1.equals(vo2)).toBe(false);
    });
});

