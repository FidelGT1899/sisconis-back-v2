import { Container } from "inversify";
import { PrismaClient } from "@prisma-generated";

import type { IIdGenerator } from "@shared-domain/ports/id-generator";
import { prisma } from "@shared-infrastructure/database/prisma/prisma.client";
import { UlidIdGenerator } from "@shared-infrastructure/id-generator/ulid-id-generator";
import { usersModule } from "@shared-kernel/ioc/modules/users.module";

import { TYPES } from "./types";


const container = new Container({ defaultScope: 'Singleton' });

// External
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);

// Shared
// container.bind(TYPES.Logger).to(Logger);
container.bind<IIdGenerator>(TYPES.IdGenerator).to(UlidIdGenerator);

// Modules
void container.load(usersModule);

export { container };
