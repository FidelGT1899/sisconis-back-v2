import { Container } from "inversify";
import { TYPES } from "./types";
import { PrismaClient } from "@prisma-generated";

import { prisma } from "@shared-infrastructure/database/prisma/prisma.client";

import { UlidIdGenerator } from "@shared-infrastructure/id-generator/ulid-id-generator";
import type { IIdGenerator } from "@shared-domain/ports/id-generator";

import { UserRepository } from "@modules/users/infrastructure/persistence/repositories/user.repository";
import type { IUserRepository } from "@modules/users/domain/repositories/user.repository.interface";

import { CreateUserUseCase } from "@modules/users/application/use-cases/create-user.use-case";
import { CreateUserController } from "@modules/users/infrastructure/http/controllers/create-user.controller";

const container = new Container({ defaultScope: 'Singleton' });

// External
container.bind<PrismaClient>(TYPES.PrismaClient).toConstantValue(prisma);

// Shared
// container.bind(TYPES.Logger).to(Logger);
container.bind<IIdGenerator>(TYPES.IdGenerator).to(UlidIdGenerator);

// Users
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind(TYPES.CreateUserUseCase).to(CreateUserUseCase);

container.bind<CreateUserController>(TYPES.CreateUserController).to(CreateUserController);

export { container };