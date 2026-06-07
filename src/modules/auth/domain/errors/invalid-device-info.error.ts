import { DomainError } from "@shared-kernel/errors/domain.error";

export class InvalidDeviceInfoError extends DomainError {
    constructor(field: 'deviceName' | 'ip' | 'userAgent') {
        super(
            'INVALID_DEVICE_INFO',
            `El campo '${field}' de la información del dispositivo es inválido o está vacío.`,
            422
        );
        this.name = 'InvalidDeviceInfoError';
    }
}
