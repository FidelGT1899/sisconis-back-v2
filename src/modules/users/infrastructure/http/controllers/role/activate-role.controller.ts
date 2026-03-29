import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import type { ActivateRoleUseCase } from "@users-application/use-cases/role/activate-role.use-case";

@injectable()
export class ActivateRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.ActivateRoleUseCase)
        private readonly useCase: ActivateRoleUseCase
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
