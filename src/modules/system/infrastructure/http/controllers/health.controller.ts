import { inject, injectable } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { HealthCheckUseCase } from "@system-application/use-cases/health-check.use-case";

@injectable()
export class HealthController extends BaseController implements Controller<void> {
    constructor(
        @inject(TYPES.HealthCheckUseCase)
        private readonly useCase: HealthCheckUseCase
    ) {
        super();
    }

    async handle(_req: HttpRequest<void>): Promise<HttpResponse> {
        const result = await this.useCase.execute();

        return this.handleResult(result);
    }
}
