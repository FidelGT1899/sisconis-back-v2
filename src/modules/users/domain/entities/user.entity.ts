import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { EntityBase } from "@shared-domain/entity.base";
import { EmailVO } from "@users-domain/value-objects/email.vo";

interface UserProps {
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export class UserEntity extends EntityBase<string> {
    private name: string;
    private lastName: string;
    private email: EmailVO;
    private password: string;

    private constructor(
        props: UserProps,
        id?: string, 
        idGenerator?: IIdGenerator, 
        createdAt?: Date, 
        updatedAt?: Date
    ) {
        super(id, idGenerator, createdAt, updatedAt);
        this.name = props.name;
        this.lastName = props.lastName;
        this.email = EmailVO.create(props.email);
        this.password = props.password;
    }

    // Getters
    public getName(): string {
        return this.name;
    }

    public getLastName(): string {
        return this.lastName;
    }

    public getEmail(): string {
        return this.email.getValue();
    }

    public getPassword(): string {
        return this.password;
    }

    // Factory method
    public static create(props: UserProps, idGenerator?: IIdGenerator): UserEntity {
        const user = new UserEntity(props, undefined, idGenerator, new Date(), new Date());
        return user;
    }

    // Behavior Method
    public changePassword(password: string): boolean {
        // TODO: Implement password validation logic
        this.password = password;
        this.updatedAt = new Date();
        return true;
    }
}