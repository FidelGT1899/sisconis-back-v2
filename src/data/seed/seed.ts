import "dotenv/config";
import { container } from "@shared-infrastructure/ioc/container";
import { TYPES } from "@shared-infrastructure/ioc/types";

import type { PrismaService } from "@shared-infrastructure/database/prisma/prisma.service";

import { roleSeedData } from '../roles';
import { usersSeedData } from '../users';

const prismaService = container.get<PrismaService>(TYPES.PrismaService);
const prisma = prismaService.getClient();

async function main() {
    console.log('Iniciando el proceso de seed...');

    try {
        await prisma.user.deleteMany();
        await prisma.role.deleteMany();
        console.log('Datos anteriores eliminados.');

        await prisma.role.createMany({
            data: roleSeedData,
        });
        console.log(`Se insertaron ${roleSeedData.length} roles.`);

        await prisma.user.createMany({
            data: usersSeedData,
        });
        console.log(`Se insertaron ${usersSeedData.length} usuarios.`);

        console.log("Seed ejecutado exitosamente.");

    } catch (error) {
        console.error('Error ejecutando el seed:', error);
        process.exit(1);
    } finally {
        console.log('Cerrando conexión con la base de datos...');
        await prismaService.disconnect();
        console.log('Conexión con la base de datos cerrada.');
    }
}

void main();