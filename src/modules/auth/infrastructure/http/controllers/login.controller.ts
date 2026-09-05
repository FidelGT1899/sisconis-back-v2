import { injectable, inject } from "inversify";

import { TYPES } from "@shared-infrastructure/ioc/types";
import { BaseController } from "@shared-infrastructure/http/base/base.controller";
import type { Controller, HttpRequest, HttpResponse } from "@shared-infrastructure/http/ports/controller";

import { LoginUseCase } from "@auth-application/use-cases/login.use-case";

import { AuthHttpMapper } from "@auth-infrastructure/mappers/auth-http.mapper";

import { LoginSchema } from "../requests/login.schema";
import { RefreshTokenCookie } from "@auth-infrastructure/http/cookies/refresh-token-cookie.factory";

@injectable()
export class LoginController extends BaseController implements Controller {
    constructor(
        @inject(TYPES.LoginUseCase)
        private readonly useCase: LoginUseCase
    ) {
        super();
    }

    async handle(req: HttpRequest): Promise<HttpResponse> {
        const parsed = LoginSchema.parse(req.body);

        const ip = req.ip ?? "unknown";
        const userAgent = this.getUserAgent(req);

        const result = await this.useCase.execute({
            email: parsed.email,
            password: parsed.password,
            ip,
            userAgent,
        });

        if (result.isErr()) {
            return this.fail(result.error());
        }

        const dto = result.value();

        return this.okWithCookies(
            AuthHttpMapper.toLoginResponse(dto),
            [RefreshTokenCookie.build(dto.refreshToken)]
        );
    }
}