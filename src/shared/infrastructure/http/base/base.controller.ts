import { AppError } from "@shared-kernel/errors/app.error";
import { HttpErrorMapper } from "../errors/error-mapper";
import type { HttpResponse } from "../ports/controller";
import type { Result } from "@shared-kernel/errors/result";
import { HttpResponseBuilder } from "@shared-infrastructure/http/base/http-response.builder";

export abstract class BaseController {
    protected ok<T = unknown>(data?: T): HttpResponse {
        return {
            statusCode: 200,
            body: HttpResponseBuilder.success(data),
        };
    }

    protected created<T = unknown>(data?: T): HttpResponse {
        return {
            statusCode: 201,
            body: HttpResponseBuilder.success(data),
        };
    }

    protected noContent(): HttpResponse {
        return {
            statusCode: 204,
        };
    }

    protected badRequest(message: string, code = "BAD_REQUEST"): HttpResponse {
        return {
            statusCode: 400,
            body: HttpResponseBuilder.error(message, code),
        };
    }

    protected fail(error: AppError): HttpResponse {
        return HttpErrorMapper.toResponse(error);
    }

    protected handleResult<T>(
        result: Result<T, AppError>,
        successStatus: "ok" | "created" = "ok"
    ): HttpResponse {
        if (result.isErr()) {
            return this.fail(result.error());
        }

        const value = result.value();

        if (successStatus === "created" && (value === undefined || value === null)) {
            return this.created();
        }

        return successStatus === "created"
            ? this.created(value)
            : this.ok(value);
    }

    protected fromResult = <T>(
        result: Result<T, AppError>,
        successStatus: "ok" | "created" = "ok"
    ): HttpResponse => {
        return this.handleResult(result, successStatus);
    }
}