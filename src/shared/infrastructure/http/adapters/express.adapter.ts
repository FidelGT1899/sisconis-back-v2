import type { NextFunction, Request, Response } from "express";
import type { Controller, HttpRequest } from "@shared-infrastructure/http/ports/controller";

export function expressAdapter(controller: Controller) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const httpRequest: HttpRequest = {
                body: req.body as unknown,
                params: req.params as Record<string, string>,
                query: req.query as Record<string, unknown>,
                headers: req.headers as Record<string, unknown>,
                ...(req.ip !== undefined && { ip: req.ip }),
                ...(req.cookies !== undefined && { cookies: req.cookies as Record<string, string> }),
                ...(req.auth !== undefined && { auth: req.auth }),
            };

            const httpResponse = await controller.handle(httpRequest);

            if (httpResponse.cookies) {
                for (const cookie of httpResponse.cookies) {
                    res.cookie(cookie.name, cookie.value, cookie.options ?? {});
                }
            }

            if (httpResponse.body) {
                res.status(httpResponse.statusCode).json(httpResponse.body);
                return;
            }

            res.sendStatus(httpResponse.statusCode);
        } catch (error) {
            next(error);
        }
    };
}