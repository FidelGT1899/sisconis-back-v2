import { inject, injectable } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { FeatureFlagsUseCase } from "@system-application/use-cases/feature-flags.use-case";

@injectable()
export class FeatureFlagsController extends BaseController implements Controller<void> {
    constructor(
        @inject(TYPES.FeatureFlagsUseCase)
        private readonly featureFlagsUseCase: FeatureFlagsUseCase
    ) {
        super();
    }

    async handle(_req: HttpRequest<void>): Promise<HttpResponse> {
        const result = await this.featureFlagsUseCase.execute();
        return this.handleResult(result);
    }
}
