import { injectable, inject } from "inversify";
import { TYPES } from "@shared-kernel/ioc/types";
import { CreateUserSchema } from "../requests/create-user.schema";
import { CreateUserUseCase } from "@modules/users/application/use-cases/create-user.use-case";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import { UserResponseMapper } from "@modules/users/infrastructure/mappers/user-response.mapper";

@injectable()
export class CreateUserController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.CreateUserUseCase)
        private readonly useCase: CreateUserUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const parsed = CreateUserSchema.parse(req.body);

        const result = await this.useCase.execute(parsed);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.created(UserResponseMapper.toResponse(result.value()));
    }
}