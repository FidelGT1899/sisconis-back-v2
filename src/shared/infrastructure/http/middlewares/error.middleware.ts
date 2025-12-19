import type { Request, Response, NextFunction } from "express";

export function globalErrorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response {
  console.error("Unhandled error:", error);

  return res.status(500).json({
    message: "Internal server error",
  });
}
