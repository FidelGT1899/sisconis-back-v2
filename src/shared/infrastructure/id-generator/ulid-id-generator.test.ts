import { UlidIdGenerator } from "./ulid-id-generator";

describe("UlidIdGenerator", () => {
    let generator: UlidIdGenerator;

    beforeEach(() => {
        generator = new UlidIdGenerator();
    });

    it("should generate a string", () => {
        const id = generator.generate();
        expect(typeof id).toBe("string");
    });

    it("should generate a valid ULID", () => {
        const id = generator.generate();

        // Regex oficial de ULID (26 chars, Crockford Base32)
        const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;

        expect(id).toMatch(ulidRegex);
    });

    it("should generate lexicographically sortable ids", async () => {
        const id1 = generator.generate();

        await new Promise((resolve) => setTimeout(resolve, 2));

        const id2 = generator.generate();

        expect(id1 < id2).toBe(true);
    });

    it("should generate unique ids", () => {
        const id1 = generator.generate();
        const id2 = generator.generate();

        expect(id1).not.toBe(id2);
    });
});
