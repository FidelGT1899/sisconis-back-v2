import { AppError } from "@shared-kernel/errors/app.error";
import { HttpResponseBuilder } from "@shared-infrastructure/http/base/http-response.builder";

import type { HttpResponse } from "../ports/controller";

export class HttpErrorMapper {
    static toResponse(error: AppError): HttpResponse {
        return {
            statusCode: error.statusCode ?? 500,
            body: HttpResponseBuilder.error(error.message, error.code),
        };
    }
}
