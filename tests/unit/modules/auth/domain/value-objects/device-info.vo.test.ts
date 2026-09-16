import { DeviceInfoVO } from '@auth-domain/value-objects/device-info.vo';
import { InvalidDeviceInfoError } from '@auth-domain/errors/invalid-device-info.error';

describe('DeviceInfoVO', () => {
    it('should create valid device info', () => {
        const result = DeviceInfoVO.create({
            deviceName: 'Chrome on Windows',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        });

        expect(result.isOk()).toBe(true);
        expect(result.value().getDeviceName()).toBe('Chrome on Windows');
        expect(result.value().getIp()).toBe('127.0.0.1');
        expect(result.value().getUserAgent()).toBe('Mozilla/5.0');
    });

    it('should trim whitespace from fields', () => {
        const result = DeviceInfoVO.create({
            deviceName: '  Chrome  ',
            ip: '  127.0.0.1  ',
            userAgent: '  Mozilla/5.0  ',
        });

        expect(result.isOk()).toBe(true);
        expect(result.value().getDeviceName()).toBe('Chrome');
        expect(result.value().getIp()).toBe('127.0.0.1');
        expect(result.value().getUserAgent()).toBe('Mozilla/5.0');
    });

    it('should fail with empty deviceName', () => {
        const result = DeviceInfoVO.create({
            deviceName: '',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDeviceInfoError);
    });

    it('should fail with empty ip', () => {
        const result = DeviceInfoVO.create({
            deviceName: 'Chrome',
            ip: '',
            userAgent: 'Mozilla/5.0',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDeviceInfoError);
    });

    it('should fail with empty userAgent', () => {
        const result = DeviceInfoVO.create({
            deviceName: 'Chrome',
            ip: '127.0.0.1',
            userAgent: '',
        });

        expect(result.isErr()).toBe(true);
        expect(result.error()).toBeInstanceOf(InvalidDeviceInfoError);
    });

    it('should be equal for same values', () => {
        const a = DeviceInfoVO.create({
            deviceName: 'Chrome',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        }).value();

        const b = DeviceInfoVO.create({
            deviceName: 'Chrome',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        }).value();

        expect(a.equals(b)).toBe(true);
    });

    it('should not be equal for different values', () => {
        const a = DeviceInfoVO.create({
            deviceName: 'Chrome',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        }).value();

        const b = DeviceInfoVO.create({
            deviceName: 'Firefox',
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
        }).value();

        expect(a.equals(b)).toBe(false);
    });
});
