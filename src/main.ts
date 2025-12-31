import "dotenv/config";
import "reflect-metadata";

import { container } from "@shared-kernel/ioc/container";
import { TYPES } from "@shared-kernel/ioc/types";

import { createApp } from "./app";
import type { UsersHttpControllers } from "@shared-kernel/ioc/modules/users.module";

// eslint-disable-next-line @typescript-eslint/require-await
async function bootstrap(): Promise<void> {
    const usersControllers = container.get<UsersHttpControllers>(TYPES.UsersControllers);

    const app = createApp({
        users: usersControllers
    });

    const PORT = process.env.PORT ?? 3000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

bootstrap().catch((error) => {
    console.error("💥 Fatal error during bootstrap", error);
    process.exit(1);
});
