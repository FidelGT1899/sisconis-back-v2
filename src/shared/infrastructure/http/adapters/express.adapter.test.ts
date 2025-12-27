import { expressAdapter } from "./express.adapter";
import type { Controller, HttpResponse } from "../ports/controller";
import type { Request, Response } from "express";

describe("expressAdapter", () => {
    let controller: jest.Mocked<Controller>;
    let req: Partial<Request>;
    let res: Partial<Response>;

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
    });

    it("should map request and return json response when body exists", async () => {
        const httpResponse: HttpResponse = {
            statusCode: 200,
            body: { status: "success", data: { ok: true } }
        };

        controller.handle.mockResolvedValue(httpResponse);

        const handler = expressAdapter(controller);
        await handler(req as Request, res as Response);

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
        await handler(req as Request, res as Response);

        expect(res.sendStatus).toHaveBeenCalledWith(204);
    });
});
