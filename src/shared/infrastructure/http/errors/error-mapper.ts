import { AppError } from "@shared-kernel/errors/app.error";
import type { HttpResponse } from "../ports/controller";

export class HttpErrorMapper {
  static toResponse(error: AppError): HttpResponse {
    return {
      statusCode: error.statusCode,
      body: {
        message: error.message
      },
    };
  }
}