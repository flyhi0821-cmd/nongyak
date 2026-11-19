import { describe, expect, it } from "vitest";
import { parseLegacy } from "./source";

describe("parseLegacy (이전 HTML 수첩 백업)", () => {
  const json = JSON.stringify({
    records: [
      { id: "r1", date: "2026-04-20", orchard: "1", pests: ["mite"], product: "산마루", created: 1 },
      { id: "r2", date: "2026-05-01", orchard: "1", pests: ["mite"], product: "신상품", code: "21A" },
      { id: "bad", date: "어제", pests: ["mite"] },
    ],
    prices: { pdb: 17000 },
    onames: { "1": "위미" },
  });
  it("형식이 맞는 새 기록만 가져온다", () => {
    const { fresh, prices, names } = parseLegacy(json, [{ id: "r1", date: "2026-04-20", orchard: "1", pests: ["mite"], product: "산마루" }]);
    expect(fresh.map((r) => r.id)).toEqual(["r2"]);
    expect(fresh[0].code).toBe("21A");
    expect(prices).toEqual({ pdb: 17000 });
    expect(names).toEqual({ "1": "위미" });
  });
  it("JSON이 아니면 예외", () => {
    expect(() => parseLegacy("not json", [])).toThrow();
  });
});
