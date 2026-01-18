import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import type { ChangeUserDniUseCase } from "@modules/users/application/use-cases/change-user-dni.use-case";

import { ChangeUserDniSchema } from "@modules/users/infrastructure/http/requests/change-user-dni.schema";

@injectable()
export class ChangeUserDniController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.ChangeUserDniUseCase)
        private readonly useCase: ChangeUserDniUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = ChangeUserDniSchema.parse(request.body);

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
