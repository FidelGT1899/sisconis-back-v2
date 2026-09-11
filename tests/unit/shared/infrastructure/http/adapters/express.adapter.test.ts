import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";
import type { Controller, HttpResponse } from "@shared-infrastructure/http/ports/controller";
import type { NextFunction, Request, Response } from "express";

describe("expressAdapter", () => {
    let controller: jest.Mocked<Controller>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        controller = {
            handle: jest.fn()
        };

        req = {
            body: { foo: "bar" },
            params: { id: "123" },
            query: { page: "1" },
            headers: { authorization: "token" }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            sendStatus: jest.fn()
        };

        next = jest.fn();
    });

    it("should map request and return json response when body exists", async () => {
        const httpResponse: HttpResponse = {
            statusCode: 200,
            body: { status: "success", data: { ok: true } }
        };

        controller.handle.mockResolvedValue(httpResponse);

        const handler = expressAdapter(controller);
        await handler(req as Request, res as Response, next);

        expect(controller.handle).toHaveBeenCalledWith({
            body: { foo: "bar" },
            params: { id: "123" },
            query: { page: "1" },
            headers: { authorization: "token" }
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(httpResponse.body);
    });

    it("should return status only when body is undefined", async () => {
        const httpResponse: HttpResponse = {
            statusCode: 204
        };

        controller.handle.mockResolvedValue(httpResponse);

        const handler = expressAdapter(controller);
        await handler(req as Request, res as Response, next);

        expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
});
