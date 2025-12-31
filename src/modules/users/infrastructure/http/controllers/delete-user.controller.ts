import { injectable, inject } from "inversify";

import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import { TYPES } from "@shared-kernel/ioc/types";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { DeleteUserUseCase } from "@users-application/use-cases/delete-user.use-case";

@injectable()
export class DeleteUserController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.DeleteUserUseCase)
        private readonly useCase: DeleteUserUseCase
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
