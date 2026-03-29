import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { UpdateUserByAdminUseCase } from "@users-application/use-cases/user/update-user-by-admin.use-case";

import { UpdateUserByAdminSchema } from "@users-infrastructure/http/requests/update-user-by-admin.schema";
import { UserHttpMapper } from "@users-infrastructure/mappers/user-http.mapper";

@injectable()
export class UpdateUserByAdminController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.UpdateUserByAdminUseCase)
        private readonly useCase: UpdateUserByAdminUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = UpdateUserByAdminSchema.parse(request.body);

        const result = await this.useCase.execute({
            id,
            ...parsed,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.ok(UserHttpMapper.toResponse(result.value()));
    }
}
