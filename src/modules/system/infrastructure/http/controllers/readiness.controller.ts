import { inject, injectable } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { ReadinessStatusUseCase } from "@system-application/use-cases/readiness-status.use-case";

@injectable()
export class ReadinessController extends BaseController implements Controller<void> {
    constructor(
        @inject(TYPES.ReadinessStatusUseCase)
        private readonly readinessStatusUseCase: ReadinessStatusUseCase
    ) {
        super();
    }

    async handle(_req: HttpRequest<void>): Promise<HttpResponse> {
        const result = await this.readinessStatusUseCase.execute();
        return this.handleResult(result);
    }
}
