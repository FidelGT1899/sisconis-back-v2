import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

const hashPassword = (plainPassword: string): string => {
    return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
};

const defaultPassword = hashPassword("password123");

export const ROLE_IDS = {
    TRABAJADOR: "292f3e87-c831-4c96-bd94-a57e0a61f199",
    VIGILANTE: "4a24ab1b-96ce-4c28-b340-740fb6f05c99",
    JEFE_AREA: "072cb85a-704a-4509-b699-4a4f7f2e7314",
    ADMINISTRADOR: "879b8606-d220-46c8-b76a-26b696cf4bea",
    JEFE_RRHH: "4ec4ce49-8987-4624-90b5-0635bcab62d5",
    GERENTE: "5c210fa9-6941-4e90-8288-7536b113ac46",
    SUPER_ADMIN: "6f1485c1-ac63-4940-b810-7f9755a8c996",
} as const;

export const usersSeedData = [
    {
        "id": "f54b347c-0d41-49eb-869f-3fbba7f1ac0b",
        "name": "Fidel",
        "lastName": "García",
        "email": "fidel@test.com",
        "dni": "72312344",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.SUPER_ADMIN,
        "status": UserStatus.ACTIVE,
        "phone": "",
        "address": "Urb Magisterial",
        "photoUrl": null,
        "createdAt": "2026-03-18T02:38:44.100Z",
        "updatedAt": "2026-03-18T02:38:44.100Z"
    },
    {
        "id": "4a2b9c71-7d3e-4b6a-9f1c-8e2d5a3b7f4c",
        "name": "Carlos",
        "lastName": "Mendoza",
        "email": "carlos.mendoza@test.com",
        "dni": "72345678",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.GERENTE,
        "status": UserStatus.ACTIVE,
        "phone": "+51987654321",
        "address": "Av. Larco 123",
        "photoUrl": null,
        "createdAt": "2026-03-19T10:15:20.000Z",
        "updatedAt": "2026-03-19T10:15:20.000Z"
    },
    {
        "id": "1e5f8a9b-3c2d-4e7f-8a1b-9c6d3e5f2a1b",
        "name": "María",
        "lastName": "Rojas",
        "email": "mrojas@test.com",
        "dni": "45678901",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.JEFE_RRHH,
        "status": UserStatus.ACTIVE,
        "phone": "+51912345678",
        "address": "Calle Los Pinos 456",
        "photoUrl": null,
        "createdAt": "2026-03-20T14:22:10.000Z",
        "updatedAt": "2026-03-20T14:22:10.000Z"
    },
    {
        "id": "9c8b7a6d-5e4f-4a2b-9c1d-8e7f6a5b4c3d",
        "name": "Jorge",
        "lastName": "Salinas",
        "email": "jsalinas@test.com",
        "dni": "76543210",
        "password": defaultPassword,
        "isPasswordTemporary": true,
        "roleId": ROLE_IDS.ADMINISTRADOR,
        "status": UserStatus.ACTIVE,
        "phone": "+51999888777",
        "address": "Urb. San Borja 32",
        "photoUrl": null,
        "createdAt": "2026-03-21T09:10:05.000Z",
        "updatedAt": "2026-03-22T11:00:00.000Z"
    },
    {
        "id": "2d3e4f5a-6b7c-4d9e-8f2a-3b4c5d6e7f8a",
        "name": "Ana",
        "lastName": "López",
        "email": "alopez@test.com",
        "dni": "71234567",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.JEFE_AREA,
        "status": UserStatus.ACTIVE,
        "phone": "+51977665544",
        "address": "Av. Arequipa 789",
        "photoUrl": null,
        "createdAt": "2026-03-23T16:45:30.000Z",
        "updatedAt": "2026-03-23T16:45:30.000Z"
    },
    {
        "id": "8e9f1a2b-3c4d-4e6f-8a8b-9c0d1e2f3a4b",
        "name": "Luis",
        "lastName": "Pérez",
        "email": "lperez@test.com",
        "dni": "40123456",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.VIGILANTE,
        "status": UserStatus.ACTIVE,
        "phone": "+51966554433",
        "address": "Calle Las Begonias 12",
        "photoUrl": null,
        "createdAt": "2026-03-24T08:30:15.000Z",
        "updatedAt": "2026-03-24T08:30:15.000Z"
    },
    {
        "id": "9e8d7c6b-5a4f-4e2d-8c0b-9a8b7c6d5e4f",
        "name": "Lucía",
        "lastName": "Fernández",
        "email": "lfernandez@test.com",
        "dni": "75678901",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.VIGILANTE,
        "status": UserStatus.ACTIVE,
        "phone": "+51933221100",
        "address": "Calle Los Rosales 89",
        "photoUrl": null,
        "createdAt": "2026-03-28T15:55:55.000Z",
        "updatedAt": "2026-03-28T15:55:55.000Z"
    },
    {
        "id": "1a2b3c4d-5e6f-4a8b-9c0d-1e2f3a4b5c6d",
        "name": "Pedro",
        "lastName": "Castillo",
        "email": "pcastillo@test.com",
        "dni": "73456789",
        "password": defaultPassword,
        "isPasswordTemporary": true,
        "roleId": ROLE_IDS.TRABAJADOR,
        "status": UserStatus.ACTIVE,
        "phone": "+51944332211",
        "address": "Av. Brasil 345",
        "photoUrl": null,
        "createdAt": "2026-03-27T13:40:10.000Z",
        "updatedAt": "2026-03-27T13:40:10.000Z"
    },
    {
        "id": "3f4e5d6c-7b8a-4f0e-9d2c-3b4a5f6e7d8c",
        "name": "Miguel",
        "lastName": "Gutiérrez",
        "email": "mgutierrez@test.com",
        "dni": "41234567",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.TRABAJADOR,
        "status": UserStatus.ACTIVE,
        "phone": "+51922110099",
        "address": "Av. Javier Prado 1001",
        "photoUrl": null,
        "createdAt": "2026-03-29T17:10:30.000Z",
        "updatedAt": "2026-03-30T08:05:20.000Z"
    },
    {
        "id": "5f6a7b8c-9d0e-4f2a-8b4c-5d6e7f8a9b0c",
        "name": "Elena",
        "lastName": "Vargas",
        "email": "evargas@test.com",
        "dni": "48765432",
        "password": defaultPassword,
        "isPasswordTemporary": false,
        "roleId": ROLE_IDS.TRABAJADOR,
        "status": UserStatus.INACTIVE,
        "phone": "+51955443322",
        "address": "Urb. Los Cedros Mz A",
        "photoUrl": null,
        "createdAt": "2026-03-25T11:20:45.000Z",
        "updatedAt": "2026-03-26T09:15:00.000Z"
    }
];