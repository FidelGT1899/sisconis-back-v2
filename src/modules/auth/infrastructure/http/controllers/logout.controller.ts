import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { LogoutUseCase } from "@auth-application/use-cases/logout.use-case";
import { RefreshTokenCookie } from "@auth-infrastructure/http/cookies/refresh-token-cookie.factory";

@injectable()
export class LogoutController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.LogoutUseCase)
        private readonly useCase: LogoutUseCase
    ) { super(); }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const auth = this.getAuth(req);
        if (!auth) {
            return this.unauthorized("Authentication required", "MISSING_AUTH");
        }

        const result = await this.useCase.execute({
            sessionId: auth.sessionId,
            userId: auth.userId,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        return this.okWithCookies(undefined, [RefreshTokenCookie.clear()]);
    }
}