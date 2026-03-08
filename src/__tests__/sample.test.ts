import { describe, expect, it } from "vitest";

describe("app-backend", () => {
    it("test1", () =>
        new Promise<void>((done) => {
            expect(1).toEqual(1);
            done();
        }));
});
