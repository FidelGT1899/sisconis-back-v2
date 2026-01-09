import { inject, injectable } from "inversify";

import { TYPES } from "@shared-kernel/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { SystemInfoUseCase } from "@system-application/use-cases/system-info.use-case";

@injectable()
export class SystemInfoController extends BaseController implements Controller<void> {
    constructor(
        @inject(TYPES.SystemInfoUseCase)
        private readonly systemInfoUseCase: SystemInfoUseCase
    ) {
        super();
    }

    async handle(_req: HttpRequest<void>): Promise<HttpResponse> {
        const result = await this.systemInfoUseCase.execute();
        return this.handleResult(result);
    }
}
