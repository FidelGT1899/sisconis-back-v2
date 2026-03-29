import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { UpdateRoleUseCase } from "@users-application/use-cases/role/update-role.use-case";

import { UpdateRoleSchema } from "@users-infrastructure/http/requests/role/update-role.schema";
import { RoleHttpMapper } from "@users-infrastructure/mappers/role-http.mapper";

@injectable()
export class UpdateRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.UpdateRoleUseCase)
        private readonly useCase: UpdateRoleUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = UpdateRoleSchema.parse(request.body);

        const result = await this.useCase.execute({
            id,
            ...parsed,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.ok(RoleHttpMapper.toResponse(result.value()));
    }
}
