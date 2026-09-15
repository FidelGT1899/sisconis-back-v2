import { UpdateUserByAdminController } from '@users-infrastructure/http/controllers/update-user-by-admin.controller';
import type { UpdateUserByAdminUseCase } from '@users-application/use-cases/user/update-user-by-admin.use-case';
import { Result } from '@shared-kernel/errors/result';
import { makeHttpRequest } from '@tests-factories/http-request.factory';
import { UserNotFoundError } from '@users-application/errors/user-not-found.error';
import { EmailAlreadyInUseError } from '@users-application/errors/email-already-in-use.error';
import { DniAlreadyInUseError } from '@users-application/errors/dni-already-in-use.error';
import type { SuccessResponse } from '@shared-infrastructure/http/ports/controller';

const mockUseCase = (): jest.Mocked<UpdateUserByAdminUseCase> =>
    ({ execute: jest.fn() } as unknown as jest.Mocked<UpdateUserByAdminUseCase>);

const VALID_UUID = '12345678-1234-4234-a234-123456789012';

const makeUpdatedUserDto = (overrides = {}) => ({
    id: VALID_UUID,
    name: 'Updated',
    lastName: 'User',
    email: 'updated@example.com',
    dni: '87654321',
    role: { id: 'role-1', name: 'Admin' },
    status: 'ACTIVE',
    phone: '555-0100',
    address: '123 Main St',
    photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
    createdAt: new Date('2024-01-01'),
    ...overrides,
});

describe('UpdateUserByAdminController', () => {
    it('should return 200 with updated user', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(makeUpdatedUserDto()));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { name: 'Updated', email: 'updated@example.com' },
            })
        );

        const body = response.body as SuccessResponse;
        expect(useCase.execute).toHaveBeenCalledWith({
            id: VALID_UUID,
            name: 'Updated',
            email: 'updated@example.com',
        });
        expect(response.statusCode).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data).toEqual({
            id: VALID_UUID,
            name: 'Updated',
            lastName: 'User',
            email: 'updated@example.com',
            dni: '87654321',
            role: { id: 'role-1', name: 'Admin' },
            status: 'ACTIVE',
            phone: '555-0100',
            address: '123 Main St',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        });
    });

    it('should return 400 when id param is missing', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        const response = await controller.handle(
            makeHttpRequest({ body: { name: 'Test' } })
        );

        expect(useCase.execute).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(400);
        expect(response.body?.status).toBe('error');
    });

    it('should throw when body is empty', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: {},
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should throw when body has no valid fields', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { unknown: 'value' },
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should accept all optional fields simultaneously', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        useCase.execute.mockResolvedValue(Result.ok(makeUpdatedUserDto()));

        const fullBody = {
            name: 'Updated',
            lastName: 'User',
            email: 'updated@example.com',
            dni: '87654321',
            phone: '555-0100',
            address: '123 Main St',
            photoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg',
        };

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: fullBody,
            })
        );

        expect(useCase.execute).toHaveBeenCalledWith({ id: VALID_UUID, ...fullBody });
        expect(response.statusCode).toBe(200);
    });

    it('should reject name shorter than 3 characters', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { name: 'ab' },
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { email: 'not-an-email' },
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should reject dni with wrong length', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { dni: '12345' },
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should reject photoUrl not matching Cloudinary pattern', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { photoUrl: 'http://example.com/img.jpg' },
                })
            )
        ).rejects.toThrow();

        expect(useCase.execute).not.toHaveBeenCalled();
    });

    it('should return error when user not found', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        const error = new UserNotFoundError(VALID_UUID);
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { name: 'New Name' },
            })
        );

        expect(response.statusCode).toBe(error.statusCode);
        expect(response.body?.status).toBe('error');
        expect(response.body?.code).toBe(error.code);
    });

    it('should return 409 when email is already in use', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        const error = new EmailAlreadyInUseError('taken@example.com');
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { email: 'taken@example.com' },
            })
        );

        expect(response.statusCode).toBe(409);
        expect(response.body?.code).toBe('EMAIL_ALREADY_IN_USE');
    });

    it('should return 409 when dni is already in use', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        const error = new DniAlreadyInUseError('12345678');
        useCase.execute.mockResolvedValue(Result.fail(error));

        const response = await controller.handle(
            makeHttpRequest({
                params: { id: VALID_UUID },
                body: { dni: '12345678' },
            })
        );

        expect(response.statusCode).toBe(409);
        expect(response.body?.code).toBe('DNI_ALREADY_IN_USE');
    });

    it('should propagate use case errors', async () => {
        const useCase = mockUseCase();
        const controller = new UpdateUserByAdminController(useCase);
        useCase.execute.mockRejectedValue(new Error('DB error'));

        await expect(
            controller.handle(
                makeHttpRequest({
                    params: { id: VALID_UUID },
                    body: { name: 'Test' },
                })
            )
        ).rejects.toThrow('DB error');
    });
});
