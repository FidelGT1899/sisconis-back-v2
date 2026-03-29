import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { GetRoleUseCase } from "@users-application/use-cases/role/get-role.use-case";

import { RoleHttpMapper } from "@users-infrastructure/mappers/role-http.mapper";

@injectable()
export class GetRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.GetRoleUseCase)
        private readonly useCase: GetRoleUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const id = this.getIdParam(req);

        if (!id) return this.missingParam("id");

        const result = await this.useCase.execute(id);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.ok(RoleHttpMapper.toResponse(result.value()));
    }
}
