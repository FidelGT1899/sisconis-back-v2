import "dotenv/config";
import "reflect-metadata";

import { createApp } from "./app";
import { container } from "@shared-kernel/ioc/container";
import { TYPES } from "@shared-kernel/ioc/types";
import type { CreateUserController } from "@modules/users/infrastructure/http/controllers/create-user.controller";

console.log("ENV CHECK =>", {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT,
});

// eslint-disable-next-line @typescript-eslint/require-await
async function bootstrap(): Promise<void> {
  const userController = container.get<CreateUserController>(
    TYPES.CreateUserController
  );

  const app = createApp(userController);
  const PORT = process.env.PORT ?? 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Fatal error during bootstrap", error);
  process.exit(1);
});
