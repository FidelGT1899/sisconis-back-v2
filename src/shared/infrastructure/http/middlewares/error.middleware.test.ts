import { globalErrorMiddleware } from "./error.middleware";
import { ZodError, z } from "zod";
import { AppError } from "@shared-kernel/errors/app.error";
import { Request, Response, NextFunction } from "express";

describe("globalErrorMiddleware", () => {
    const req = {} as Request;
    const next = jest.fn() as NextFunction;

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    } as unknown as Response;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should handle ZodError", () => {
        const schema = z.object({
            email: z.string().email()
        });

        let error!: ZodError;

        try {
            schema.parse({ email: "not-an-email" });
        } catch (err) {
            if (!(err instanceof ZodError)) {
                throw err;
            }
            error = err;
        }

        globalErrorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalled();
    });

    it("should handle AppError", () => {
        const error = new AppError("TEST_ERROR", "Boom", 418) as AppError;

        globalErrorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(418);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            error: {
                code: "TEST_ERROR",
                message: "Boom"
            }
        });
    });

    it("should handle generic Error", () => {
        const error = new Error("Something broke");

        globalErrorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
    });

    it("should handle unknown error", () => {
        globalErrorMiddleware("wtf", req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();
    });
});
