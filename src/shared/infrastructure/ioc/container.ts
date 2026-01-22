import { Container } from "inversify";

import { usersModule } from "@shared-infrastructure/ioc/modules/users.module";
import { systemModule } from "@shared-infrastructure/ioc/modules/system.module";

import { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import { UlidIdGenerator } from "@shared-infrastructure/id-generator/ulid-id-generator";
import { UuidIdGenerator } from "@shared-infrastructure/id-generator/uuid-id-generator";
import { BCryptPasswordHasher } from "@shared-infrastructure/auth/bcrypt-password-hasher";

import type { IEntityIdGenerator, IAuditIdGenerator } from "@shared-domain/ports/id-generator";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

import { TYPES } from "./types";

const container = new Container({ defaultScope: 'Singleton' });

// External
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);

// Shared
// container.bind(TYPES.Logger).to(Logger);
container.bind<IEntityIdGenerator>(TYPES.EntityIdGenerator).to(UuidIdGenerator);
container.bind<IAuditIdGenerator>(TYPES.AuditIdGenerator).to(UlidIdGenerator);
container.bind<IPasswordHasher>(TYPES.PasswordHasher).to(BCryptPasswordHasher);

// Modules
void container.load(usersModule, systemModule);

export { container };
