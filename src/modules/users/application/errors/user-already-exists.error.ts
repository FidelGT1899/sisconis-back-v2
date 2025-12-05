import { ApplicationError } from '@shared-kernel/errors/application.error';

export class UserAlreadyExistsError extends ApplicationError {
  constructor(email: string) {
    super(`El correo electrónico '${email}' ya se encuentra registrado.`, 400);
    this.name = 'UserAlreadyExistsError';
  }
}