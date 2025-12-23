import type { Request, Response } from "express";
import type { Controller, HttpRequest } from "../ports/controller";

export function expressAdapter(controller: Controller) {
    return async (req: Request, res: Response) => {
        const httpRequest: HttpRequest = {
            body: req.body as unknown,
            params: req.params as Record<string, string>,
            query: req.query as Record<string, unknown>,
            headers: req.headers as Record<string, unknown>,
        };

        const httpResponse = await controller.handle(httpRequest);

        if (httpResponse.body) {
            return res
                .status(httpResponse.statusCode)
                .json(httpResponse.body);
        }

        return res.sendStatus(httpResponse.statusCode);
    };
}