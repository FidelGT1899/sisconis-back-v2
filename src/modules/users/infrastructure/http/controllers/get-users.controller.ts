import { injectable, inject } from "inversify";

import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import { TYPES } from "@shared-kernel/ioc/types";

import { GetUsersUseCase } from "@users-application/use-cases/get-users.use-case";

import { PaginationUserSchema } from "@users-infrastructure/http/requests/pagination-user.schema";
import { UserResponseMapper } from "@users-infrastructure/mappers/user-response.mapper";

@injectable()
export class GetUsersController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.GetUsersUseCase)
        private readonly useCase: GetUsersUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest<unknown>): Promise<HttpResponse> {
        const parsed = PaginationUserSchema.parse(req.query);

        const result = await this.useCase.execute(parsed);

        if (result.isErr()) {
            return this.fail(result.error());
        }

        const { items, total, page, limit } = result.value();

        return this.ok(
            items.map(user => UserResponseMapper.toResponse(user)),
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        );
    }
}
