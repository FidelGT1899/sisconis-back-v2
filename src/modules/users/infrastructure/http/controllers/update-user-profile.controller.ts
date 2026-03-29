import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { UpdateUserProfileUseCase } from "@users-application/use-cases/user/update-user-profile.use-case";

import { UpdateUserProfileSchema } from "@users-infrastructure/http/requests/update-user-profile.schema";
import { UserHttpMapper } from "@users-infrastructure/mappers/user-http.mapper";

@injectable()
export class UpdateUserProfileController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.UpdateUserProfileUseCase)
        private readonly useCase: UpdateUserProfileUseCase
    ) {
        super();
    }

    async handle(request: HttpRequest<unknown>): Promise<HttpResponse> {
        const id = this.getIdParam(request);

        if (!id) return this.missingParam("id");

        const parsed = UpdateUserProfileSchema.parse(request.body);

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
