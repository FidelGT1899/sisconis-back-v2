import { injectable, inject } from "inversify";

import { TYPES } from "@shared-kernel/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { GetUserUseCase } from "@users-application/use-cases/get-user.use-case";

import { UserResponseMapper } from "@users-infrastructure/mappers/user-response.mapper";

@injectable()
export class GetUserController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.GetUserUseCase)
        private readonly useCase: GetUserUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const id = this.getIdParam(req);

        if (!id) return this.missingParam("id");

        const result = await this.useCase.execute(id);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.ok(UserResponseMapper.toResponse(result.value()));
    }
}
