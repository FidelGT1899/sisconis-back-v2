import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import type { DeactivateRoleUseCase } from "@users-application/use-cases/role/deactivate-role.use-case";

@injectable()
export class DeactivateRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.DeactivateRoleUseCase)
        private readonly useCase: DeactivateRoleUseCase
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
