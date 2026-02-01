import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { CreateRoleUseCase } from "@users-application/use-cases/role/create-role.use-case";

import { RoleResponseMapper } from "@users-infrastructure/mappers/role-response.mapper";

import { CreateRoleSchema } from "@users-infrastructure/http/requests/role/create-role.schema";

@injectable()
export class CreateRoleController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.CreateRoleUseCase)
        private readonly useCase: CreateRoleUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const parsed = CreateRoleSchema.parse(req.body);

        const result = await this.useCase.execute(parsed);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.created(RoleResponseMapper.toResponse(result.value()));
    }
}
