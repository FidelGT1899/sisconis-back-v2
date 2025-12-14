import { UuidIdGenerator } from "./uuid-id-generator";

describe("Uuid generator", () => {
    let generator: UuidIdGenerator;

    beforeEach(() => {
        generator = new UuidIdGenerator();
    });

    it("should generate a string", () => {
        const id = generator.generate();
        expect(typeof id).toBe("string");
    });

    it("should generate a valid UUID v4", () => {
        const id = generator.generate();

        // Regex de UUID v4 estándar
        const uuidV4Regex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        expect(id).toMatch(uuidV4Regex);
    });

    it("should generate unique ids", () => {
        const id1 = generator.generate();
        const id2 = generator.generate();

        expect(id1).not.toBe(id2);
    });
});