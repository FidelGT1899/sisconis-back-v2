import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { RefreshTokenUseCase } from "@auth-application/use-cases/refresh-token.use-case";
import { RefreshTokenCookie } from "@auth-infrastructure/http/cookies/refresh-token-cookie.factory";
import { AuthHttpMapper } from "@auth-infrastructure/mappers/auth-http.mapper";

import { RefreshTokenSchema } from "../requests/refresh-token.schema";

@injectable()
export class RefreshTokenController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.RefreshTokenUseCase)
        private readonly useCase: RefreshTokenUseCase
    ) { super(); }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const parsed = RefreshTokenSchema.parse(req.body);

        const refreshToken = this.getCookie(req, "refreshToken");
        if (!refreshToken) {
            return this.unauthorized("Refresh token is required", "MISSING_REFRESH_TOKEN");
        }

        const result = await this.useCase.execute({
            sessionId: parsed.sessionId,
            refreshToken,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        const dto = result.value();

        return this.okWithCookies(
            AuthHttpMapper.toRefreshTokenResponse(dto),
            [RefreshTokenCookie.build(dto.refreshToken)]
        );
    }
}