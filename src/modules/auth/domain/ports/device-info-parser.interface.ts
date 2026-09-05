export interface IDeviceInfoParser {
    parse(userAgent: string): string;
}