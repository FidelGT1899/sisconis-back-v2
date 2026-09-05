import { UAParser } from "ua-parser-js";
import { injectable } from "inversify";

import type { IDeviceInfoParser } from "@auth-domain/ports/device-info-parser.interface";

const UNKNOWN_DEVICE_NAME = 'Unknown device';

@injectable()
export class UaParserDeviceInfoParser implements IDeviceInfoParser {
    public parse(userAgent: string): string {
        const result = UAParser(userAgent);

        const browser = result.browser.name;
        const os = result.os.name;

        if (!browser && !os) {
            return UNKNOWN_DEVICE_NAME;
        }

        if (!browser) {
            return os as string;
        }

        if (!os) {
            return browser;
        }

        return `${browser} on ${os}`;
    }
}