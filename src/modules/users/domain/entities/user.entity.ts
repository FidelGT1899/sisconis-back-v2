import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { EntityBase, type BaseEntityProps } from "@shared-domain/entity.base";
import { EmailVO } from "@users-domain/value-objects/email.vo";

interface UserProps extends BaseEntityProps<string> {
    name: string;
    lastName: string;
    email: string;
    password: string;
}

export class UserEntity extends EntityBase<string, UserProps> {
    private props: UserProps;
    private email: EmailVO;

    private constructor(props: UserProps) {
        super(props);
        this.props = props;
        this.email = EmailVO.create(props.email);
    }

    // Getters
    public getName(): string {
        return this.props.name;
    }

    public getLastName(): string {
        return this.props.lastName;
    }

    public getEmail(): string {
        return this.email.getValue();
    }

    public getPassword(): string {
        return this.props.password;
    }

    /**
     * Factory method
     * Use Omit to exclude BaseEntityProps from UserProps
    */
    public static create(
        payload: Omit<UserProps, keyof BaseEntityProps<string>>, 
        idGenerator: IIdGenerator
    ): UserEntity {
        return new UserEntity({
            ...payload,
            idGenerator,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    // Behavior Method
    public changePassword(password: string): boolean {
        // TODO: Implement password validation logic
        this.props.password = password;
        this.updatedAt = new Date();
        return true;
    }
}