import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { UpdateUserUseCase } from "@users-application/use-cases/update-user.use-case";

import { UpdateUserSchema } from "@users-infrastructure/http/requests/update-user.schema";
import { UserResponseMapper } from "@users-infrastructure/mappers/user-response.mapper";

@injectable()
export class UpdateUserController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.UpdateUserUseCase)
        private readonly useCase: UpdateUserUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = UpdateUserSchema.parse(request.body);

        const result = await this.useCase.execute({
            id,
            ...parsed,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.ok(UserResponseMapper.toResponse(result.value()));
    }
}
