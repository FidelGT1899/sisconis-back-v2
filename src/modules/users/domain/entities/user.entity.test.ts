import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { UserEntity } from "./user.entity";

const mockIdGenerator: IIdGenerator = {
    generate: jest.fn(() => 'mock-uuid-12345'),
};

const baseProps = {
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedpassword123',
};

describe('UserEntity', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new UserEntity with generated ID and current dates', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);

            expect(user).toBeInstanceOf(UserEntity);
            
            expect(mockIdGenerator.generate).toHaveBeenCalledTimes(1);
            expect(user.getId()).toBe('mock-uuid-12345');
            
            expect(user.getEmail()).toBe(baseProps.email);
            
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
            expect(user.createdAt.getTime()).toBeCloseTo(new Date().getTime(), -100); 
        });

        it('should initialize basic properties correctly via getters', () => {
            const user = UserEntity.create(baseProps, mockIdGenerator);
            
            expect(user.getName()).toBe('John');
            expect(user.getLastName()).toBe('Doe');
            expect(user.getPassword()).toBe('hashedpassword123');
        });
        
        it('should throw InvalidEmailError if props contains invalid email', () => {
            const invalidProps = { ...baseProps, email: 'not-an-email' };
             
            expect(() => UserEntity.create(invalidProps, mockIdGenerator)).toThrow();
        });
    });

    describe('changePassword', () => {
        let user: UserEntity;
        let originalUpdatedAt: Date;

        beforeEach(() => {
            originalUpdatedAt = new Date(2025, 0, 1, 10, 0, 0); // Enero 1, 2025
            const data = { ...baseProps, id: '123', createdAt: new Date(), updatedAt: originalUpdatedAt };
            user = UserEntity.fromPersistence(data);
        });

        it('should update the password property', () => {
            const newPassword = 'newHashedPassword456';
            user.changePassword(newPassword);

            expect(user.getPassword()).toBe(newPassword);
        });

        it('should update the updatedAt timestamp', () => {
            user.changePassword('temp-pass');
            
            expect(user.updatedAt!.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });

    describe('fromPersistence', () => {
        it('should recreate the entity using all persistence data', () => {
            const persistenceData = {
                id: 'db-id-789',
                name: 'Jane',
                lastName: 'Smith',
                email: 'jane@db.com',
                password: 'db-hash',
                createdAt: new Date('2024-01-01T10:00:00.000Z'),
                updatedAt: new Date('2024-05-15T12:00:00.000Z'),
            };

            const user = UserEntity.fromPersistence(persistenceData);

            expect(user.getId()).toBe(persistenceData.id);
            expect(user.createdAt).toEqual(persistenceData.createdAt);
            expect(user.updatedAt).toEqual(persistenceData.updatedAt);
            
            expect(user.getName()).toBe('Jane');
            expect(user.getEmail()).toBe('jane@db.com'); 
            
            expect(mockIdGenerator.generate).not.toHaveBeenCalled();
        });
    });
});