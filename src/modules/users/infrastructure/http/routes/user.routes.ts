import { Router } from "express";
import { expressAdapter } from "@shared-infrastructure/http/adapters/express.adapter";
import type { CreateUserController } from "@modules/users/infrastructure/http/controllers/create-user.controller";

export function createUserRoutes(
  controller: CreateUserController
): Router {
  const router = Router();

  router.post("/", expressAdapter(controller));

  return router;
}