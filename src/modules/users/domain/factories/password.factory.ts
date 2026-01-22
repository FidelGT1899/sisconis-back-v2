import { Result } from "@shared-kernel/errors/result";
import type { InvalidPasswordError } from "@users-domain/errors/invalid-password.error";
import { PasswordVO } from "@users-domain/value-objects/password.vo";
import { TemporaryPasswordVO } from "@users-domain/value-objects/temporary-password.vo";
import type { DniVO } from "@users-domain/value-objects/dni.vo";
import type { IPasswordHasher } from "@shared-domain/ports/password-hasher";

export type PasswordType = PasswordVO | TemporaryPasswordVO;

export class PasswordFactory {
    static async createPermanent(
        plainPassword: string,
        hasher: IPasswordHasher
    ): Promise<Result<PasswordVO, InvalidPasswordError>> {
        return PasswordVO.create(plainPassword, hasher);
    }

    static async createTemporaryFromDni(
        dni: DniVO,
        hasher: IPasswordHasher
    ): Promise<TemporaryPasswordVO> {
        return TemporaryPasswordVO.fromDni(dni, hasher);
    }

    static fromHashed(hashedPassword: string): PasswordVO {
        return PasswordVO.fromHashed(hashedPassword);
    }

    static rehydratePermanent(hashed: string): PasswordVO {
        return PasswordVO.fromHashed(hashed);
    }

    static rehydrateTemporary(hashed: string): TemporaryPasswordVO {
        return TemporaryPasswordVO.fromHashed(hashed);
    }
}
