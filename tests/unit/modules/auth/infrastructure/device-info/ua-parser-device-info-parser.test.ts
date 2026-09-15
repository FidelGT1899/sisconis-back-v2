import { UaParserDeviceInfoParser } from '@auth-infrastructure/device-info/ua-parser-device-info-parser';

describe('UaParserDeviceInfoParser', () => {
    let parser: UaParserDeviceInfoParser;

    beforeEach(() => {
        parser = new UaParserDeviceInfoParser();
    });

    it('should parse Chrome on Windows user agent', () => {
        const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        const result = parser.parse(ua);

        expect(result).toBe('Chrome on Windows');
    });

    it('should parse Firefox on macOS user agent', () => {
        const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0';

        const result = parser.parse(ua);

        expect(result).toBe('Firefox on macOS');
    });

    it('should parse mobile user agent into browser on iOS', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

        const result = parser.parse(ua);

        expect(result).toBe('Mobile Safari on iOS');
    });

    it('should return "Unknown device" for empty user agent', () => {
        const result = parser.parse('');

        expect(result).toBe('Unknown device');
    });

    it('should return "Unknown device" for unrecognized user agent', () => {
        const result = parser.parse('some-random-string');

        expect(result).toBe('Unknown device');
    });

    it('should return "Unknown device" for a bot user agent without browser info', () => {
        const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

        const result = parser.parse(ua);

        expect(result).toBe('Unknown device');
    });
});
