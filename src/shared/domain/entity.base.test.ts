import { EntityBase, type BaseEntityProps } from './entity.base';
import type { IEntityIdGenerator } from '@shared-domain/ports/id-generator';

class TestEntity extends EntityBase<string, BaseEntityProps<string>> {
    constructor(props: BaseEntityProps<string>) {
        super(props);
    }
}

describe('EntityBase', () => {
    it('should create entity with provided id', () => {
        const entity = new TestEntity({ id: 'id-123' });

        expect(entity.getId()).toBe('id-123');
        expect(entity.getCreatedAt()).toBeInstanceOf(Date);
    });

    it('should use createdAt from props if provided', () => {
        const date = new Date('2024-01-01');
        const entity = new TestEntity({ id: 'id-123', createdAt: date });

        expect(entity.getCreatedAt()).toBe(date);
    });

    it('should create entity using idGenerator when id is not provided', () => {
        const idGenerator: IEntityIdGenerator = {
            generate: () => 'generated-id'
        };

        const entity = new TestEntity({ idGenerator });

        expect(entity.getId()).toBe('generated-id');
    });

    it('should throw error if neither id nor idGenerator is provided', () => {
        expect(() => {
            new TestEntity({});
        }).toThrow('Entity requires an ID or an ID generator.');
    });

    it('should consider two entities equal if they have the same id', () => {
        const entity1 = new TestEntity({ id: 'same-id' });
        const entity2 = new TestEntity({ id: 'same-id' });

        expect(entity1.equals(entity2)).toBe(true);
    });

    it('should consider two entities different if they have different ids', () => {
        const entity1 = new TestEntity({ id: 'id-1' });
        const entity2 = new TestEntity({ id: 'id-2' });

        expect(entity1.equals(entity2)).toBe(false);
    });

    it('should return createdAt when updatedAt is not set', () => {
        const entity = new TestEntity({ id: 'id-123' });

        expect(entity.getUpdatedAt()).toBe(entity.getCreatedAt());
    });

    it('should return updatedAt when it is set', () => {
        const updatedAt = new Date('2024-06-01');
        const entity = new TestEntity({ id: 'id-123', updatedAt });

        expect(entity.getUpdatedAt()).toBe(updatedAt);
    });
});
