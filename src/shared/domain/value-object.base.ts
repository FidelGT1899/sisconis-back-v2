export abstract class ValueObjectBase<T> {
    protected abstract getEqualityComponents(): T;

    public equals(other: ValueObjectBase<T>): boolean {
        if (other === null || other === undefined) {
            return false;
        }
        
        const components = this.getEqualityComponents();
        const otherComponents = other.getEqualityComponents();
        
        if (components === null || components === undefined) {
            return false;
        }
        
        if (typeof components !== 'object') {
            return components === otherComponents;
        }
        
        return JSON.stringify(components) === JSON.stringify(otherComponents);
    }

    public abstract getValue(): T;
}