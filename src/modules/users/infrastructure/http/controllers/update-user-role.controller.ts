import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import type { UpdateUserRoleUseCase } from "@users-application/use-cases/user/update-user-role.use-case";

import { UpdateUserRoleSchema } from "@users-infrastructure/http/requests/update-user-role.schema";

@injectable()
export class UpdateUserRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.UpdateUserRoleUseCase)
        private readonly useCase: UpdateUserRoleUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = UpdateUserRoleSchema.parse(request.body);

        const result = await this.useCase.execute({
            userId: id,
            newRoleId: parsed.roleId,
            executorId: parsed.executorId,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.noContent();
    }
}
