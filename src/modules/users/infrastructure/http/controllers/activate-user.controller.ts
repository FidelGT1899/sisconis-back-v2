import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import type { ActivateUserUseCase } from "@users-application/use-cases/user/activate-user.use-case";

@injectable()
export class ActivateUserController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.ActivateUserUseCase)
        private readonly useCase: ActivateUserUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const result = await this.useCase.execute(id);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.noContent();
    }
}
