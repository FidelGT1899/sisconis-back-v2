export abstract class ValueObjectBase {
    protected abstract getEqualityComponents(): ReadonlyArray<unknown>;

    public equals(other?: ValueObjectBase): boolean {
        if (!other) return false;
        if (this === other) return true;
        if (this.constructor !== other.constructor) return false;

        const components = this.getEqualityComponents();
        const otherComponents = other.getEqualityComponents();

        if (components.length !== otherComponents.length) {
            return false;
        }

        return components.every((value, index) => {
            return value === otherComponents[index];
        });
    }
}
