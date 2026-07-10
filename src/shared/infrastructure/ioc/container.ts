import { Container } from "inversify";

import { usersModule } from "@shared-infrastructure/ioc/modules/users.module";
import { systemModule } from "@shared-infrastructure/ioc/modules/system.module";
import { rolesModule } from "@shared-infrastructure/ioc/modules/roles.module";

import { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import { UlidIdGenerator } from "@shared-infrastructure/id-generator/ulid-id-generator";
import { UuidIdGenerator } from "@shared-infrastructure/id-generator/uuid-id-generator";
import { BCryptPasswordHasher } from "@shared-infrastructure/auth/bcrypt-password-hasher";
import { ConsoleLogger } from "@shared-infrastructure/logging/console-logger";
import { createGlobalErrorMiddleware } from "@shared-infrastructure/http/middlewares/error.middleware";
import type { ILogger } from "@shared-domain/ports/logger";

import type { IEntityIdGenerator, IAuditIdGenerator } from "@shared-domain/ports/id-generator";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import { TYPES } from "./types";

const container = new Container({ defaultScope: 'Singleton' });

// External
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);

// Shared
container.bind<IEntityIdGenerator>(TYPES.EntityIdGenerator).to(UuidIdGenerator);
container.bind<IAuditIdGenerator>(TYPES.AuditIdGenerator).to(UlidIdGenerator);
container.bind<IPasswordHasher>(TYPES.PasswordHasher).to(BCryptPasswordHasher);
container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger);
container.bind(TYPES.GlobalErrorMiddleware)
    .toDynamicValue((ctx) => createGlobalErrorMiddleware(ctx.get(TYPES.Logger)));

// Modules
void container.load(usersModule, systemModule, rolesModule);

export { container };
