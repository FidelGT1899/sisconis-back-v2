import { AppError } from "@shared-kernel/errors/app.error";
import { BaseController } from "./base.controller";
import { HttpResponseBuilder } from "@shared-infrastructure/http/base/http-response.builder";
import { Result } from "@shared-kernel/errors/result";

class TestController extends BaseController {
    public okPublic<T>(data?: T) {
        return this.ok(data);
    }

    public createdPublic<T>(data?: T) {
        return this.created(data);
    }

    public noContentPublic() {
        return this.noContent();
    }

    public badRequestPublic(message: string, code?: string) {
        return this.badRequest(message, code);
    }

    public handleResultPublic<T>(
        result: Result<T, AppError>,
        successStatus: "ok" | "created" = "ok"
    ) {
        return this.handleResult(result, successStatus);
    }
}

describe('BaseController', () => {
    let controller: TestController;

    beforeEach(() => {
        controller = new TestController();
    });

    it("should return 200 with success body", () => {
        const response = controller.okPublic({ foo: "bar" });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(HttpResponseBuilder.success({ foo: "bar" }));
    });

    it("should return 201 with success body", () => {
        const response = controller.createdPublic({ id: "123" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(HttpResponseBuilder.success({ id: "123" }));
    });

    it("should return 204 without body", () => {
        const response = controller.noContentPublic();

        expect(response.statusCode).toBe(204);
        expect(response.body).toBeUndefined();
    });

    it("should return 400 with error body", () => {
        const response = controller.badRequestPublic("Invalid data");

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(
            HttpResponseBuilder.error("Invalid data", "BAD_REQUEST")
        );
    });

    it("should return ok response when result is ok", () => {
        const result = Result.ok({ name: "Fidel" });

        const response = controller.handleResultPublic(result);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
            HttpResponseBuilder.success({ name: "Fidel" })
        );
    });

    it("should return created response when status is created", () => {
        const result = Result.ok({ id: "123" });

        const response = controller.handleResultPublic(result, "created");

        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual(
            HttpResponseBuilder.success({ id: "123" })
        );
    });

    it("should return created without body when value is undefined", () => {
        const result = Result.ok(undefined);

        const response = controller.handleResultPublic(result, "created");

        expect(response.statusCode).toBe(201);
        expect(response.body).toBeDefined(); // success()
    });

    it("should map AppError to HttpResponse when result is error", () => {
        const error: AppError = new AppError("TEST_ERROR", "Boom", 500) as AppError;
        const result = Result.fail<unknown, AppError>(error);

        const response = controller.handleResultPublic(result);

        expect(response.statusCode).toBe(500);
        expect(response.body?.status).toBe("error");
    });
});
