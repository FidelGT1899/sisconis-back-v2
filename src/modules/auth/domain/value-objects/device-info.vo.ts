import { Result } from "@shared-kernel/errors/result";
import { ValueObjectBase } from "@shared-domain/value-object.base";
import { InvalidDeviceInfoError } from "@auth-domain/errors/invalid-device-info.error";

interface DeviceInfoProps {
    deviceName: string;
    ip: string;
    userAgent: string;
}

export class DeviceInfoVO extends ValueObjectBase {
    private readonly props: DeviceInfoProps;

    private constructor(props: DeviceInfoProps) {
        super();
        this.props = props;
    }

    protected getEqualityComponents(): ReadonlyArray<unknown> {
        return [this.props.deviceName, this.props.ip, this.props.userAgent];
    }

    public getDeviceName(): string { return this.props.deviceName; }
    public getIp(): string { return this.props.ip; }
    public getUserAgent(): string { return this.props.userAgent; }

    public static create(
        raw: DeviceInfoProps
    ): Result<DeviceInfoVO, InvalidDeviceInfoError> {
        const deviceName = raw.deviceName.trim();
        const ip = raw.ip.trim();
        const userAgent = raw.userAgent.trim();

        if (!deviceName) return Result.fail(new InvalidDeviceInfoError('deviceName'));
        if (!ip) return Result.fail(new InvalidDeviceInfoError('ip'));
        if (!userAgent) return Result.fail(new InvalidDeviceInfoError('userAgent'));

        return Result.ok(new DeviceInfoVO({ deviceName, ip, userAgent }));
    }
}
