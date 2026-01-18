import { Container } from "inversify";

import { usersModule } from "@shared-infrastructure/ioc/modules/users.module";
import { systemModule } from "@shared-infrastructure/ioc/modules/system.module";

import { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";
import { UlidIdGenerator } from "@shared-infrastructure/id-generator/ulid-id-generator";

import type { IIdGenerator } from "@shared-domain/ports/id-generator";

import { TYPES } from "./types";

const container = new Container({ defaultScope: 'Singleton' });

// External
container.bind<PrismaService>(TYPES.PrismaService).to(PrismaService);

// Shared
// container.bind(TYPES.Logger).to(Logger);
container.bind<IIdGenerator>(TYPES.IdGenerator).to(UlidIdGenerator);

// Modules
void container.load(usersModule, systemModule);

export { container };
