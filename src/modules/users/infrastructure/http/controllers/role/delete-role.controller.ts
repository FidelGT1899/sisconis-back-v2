import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { DeleteRoleUseCase } from "@users-application/use-cases/role/delete-role.use-case";

@injectable()
export class DeleteRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.DeleteRoleUseCase)
        private readonly useCase: DeleteRoleUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(req);

        if (!id) return this.missingParam("id");

        const result = await this.useCase.execute(id);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.noContent();
    }
}
