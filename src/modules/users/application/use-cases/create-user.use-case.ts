import { Result } from "@shared-kernel/errors/result";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserAlreadyExistsError } from "../errors/user-already-exists.error";
import { AppError } from "@shared-kernel/errors/app.error";
import { UnexpectedError } from "@shared-kernel/errors/unexpected.error";
import type { IUserRepository } from "../../domain/repositories/user.repository.interface";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import type { CreateUserDto } from "../dtos/create-user.dto";
import { injectable, inject } from "inversify";
import { TYPES } from "@shared-kernel/ioc/types";

export type CreateUserResult = Result<UserEntity, AppError>;

@injectable()
export class CreateUserUseCase {
    constructor(
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
        @inject(TYPES.IdGenerator)
        private readonly idGenerator: IIdGenerator,
    ) { }

    async execute(dto: CreateUserDto): Promise<CreateUserResult> {
        const emailExists = await this.userRepository.existsByEmail(dto.email);

        if (emailExists) {
            return Result.fail(new UserAlreadyExistsError(dto.email));
        }

        try {
            const user = UserEntity.create(
                {
                    name: dto.name,
                    lastName: dto.lastName,
                    email: dto.email,
                    password: dto.password,
                },
                this.idGenerator,
            );

            await this.userRepository.save(user);

            return Result.ok(user);
        } catch (error) {
            if (error instanceof AppError) {
                return Result.fail(error);
            }
            const message = (error instanceof Error)
                ? error.message
                : 'Un error desconocido ha ocurrido.';
            return Result.fail(new UnexpectedError('UNEXPECTED_ERROR', message));
        }
    }
}