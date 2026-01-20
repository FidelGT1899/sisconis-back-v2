import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { ChangeUserPasswordUseCase } from "@users-application/use-cases/change-user-password.use-case";

import { ChangeUserPasswordSchema } from "@users-infrastructure/http/requests/change-user-password.schema";

@injectable()
export class ChangeUserPasswordController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.ChangeUserPasswordUseCase)
        private readonly useCase: ChangeUserPasswordUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = ChangeUserPasswordSchema.parse(request.body);

        const result = await this.useCase.execute({
            id,
            ...parsed,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.noContent();
    }
}
