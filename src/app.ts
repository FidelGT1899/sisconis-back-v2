import express from "express";
import { createUserRoutes } from "@modules/users/infrastructure/http/routes/user.routes";
import { globalErrorMiddleware } from "@shared-infrastructure/http/middlewares/error.middleware";
import type { CreateUserController } from "@modules/users/infrastructure/http/controllers/create-user.controller";
import type { Express } from "express";

export function createApp(userController: CreateUserController): Express {
	const app = express();

	app.use(express.json());

	// health check
	app.get("/health", (_req, res) => {
		res.status(200).json({ status: "ok" });
	});

	// routes
	app.use("/users", createUserRoutes(userController));

	// error middleware
	app.use(globalErrorMiddleware);

	return app;
}
