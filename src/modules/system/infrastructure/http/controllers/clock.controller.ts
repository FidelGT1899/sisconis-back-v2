import { inject, injectable } from "inversify";

import { TYPES } from "@shared-kernel/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { ClockUseCase } from "@system-application/use-cases/clock.use-case";

@injectable()
export class ClockController extends BaseController implements Controller<void> {
    constructor(
        @inject(TYPES.ClockUseCase)
        private readonly clockUseCase: ClockUseCase
    ) {
        super();
    }

    async handle(_req: HttpRequest<void>): Promise<HttpResponse> {
        const result = await this.clockUseCase.execute();
        return this.handleResult(result);
    }
}
