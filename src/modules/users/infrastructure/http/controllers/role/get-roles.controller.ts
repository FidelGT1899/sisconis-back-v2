import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";

import { GetRolesUseCase } from "@users-application/use-cases/role/get-roles.use-case";

import { PaginationRoleSchema } from "@users-infrastructure/http/requests/role/pagination-role.schema";
import { RoleResponseMapper } from "@users-infrastructure/mappers/role-response.mapper";

@injectable()
export class GetRolesController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.GetRolesUseCase)
        private readonly useCase: GetRolesUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest<unknown>): Promise<HttpResponse> {
        const parsed = PaginationRoleSchema.parse(req.query);

        const result = await this.useCase.execute(parsed);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        const { items, total, page, limit } = result.value();

        return this.ok(
            items.map(role => RoleResponseMapper.toResponse(role)),
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        );
    }
}
