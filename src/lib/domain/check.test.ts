import { describe, expect, it } from "vitest";
import { checkRecord, levelOf, recommend } from "./check";
import { codeFromLabel, groupOf, resolveProduct } from "./moa";
import type { SprayRecord } from "./types";

const rec = (id: string, date: string, product: string, pests: string[], orchard = "1", code?: string): SprayRecord => ({
  id, date, product, pests, orchard, code,
});

describe("groupOf / codeFromLabel", () => {
  it("묶음 번호로 정규화", () => {
    expect(groupOf("IRAC 21A")).toBe("IRAC 21");
    expect(groupOf("FRAC M3")).toBe("FRAC M3");
    expect(groupOf("21A")).toBe("IRAC 21");
    expect(groupOf("M1")).toBe("FRAC M1");
    expect(groupOf("UN")).toBe("UN");
  });
  it("라벨 표기 변환", () => {
    expect(codeFromLabel("21a")).toBe("IRAC 21A");
    expect(codeFromLabel("frac 11")).toBe("FRAC 11");
  });
});

describe("resolveProduct", () => {
  it("접두 일치와 혼합제", () => {
    expect(resolveProduct("산마루 수화제")?.ids).toEqual(["pdb"]);
    expect(resolveProduct("슈퍼펀치")?.ids).toEqual(["abm", "sfx"]);
    expect(resolveProduct("없는상품")).toBeNull();
  });
});

describe("checkRecord", () => {
  it("같은 대상에 같은 기작이 이어지면 bad", () => {
    const list = [rec("a", "2026-04-20", "산마루", ["mite"]), rec("b", "2026-06-15", "피라니카", ["mite"])];
    const issues = checkRecord(list[1], list);
    expect(levelOf(issues)).toBe("bad");
    expect(issues[0]).toMatchObject({ kind: "consecutive", group: "IRAC 21" });
  });
  it("다른 과원은 서로 영향 없음", () => {
    const list = [rec("a", "2026-04-20", "산마루", ["mite"], "1"), rec("b", "2026-04-25", "피라니카", ["mite"], "2")];
    expect(checkRecord(list[1], list)).toEqual([]);
  });
  it("다른 대상 사이에 끼어도 30일 안 재사용은 warn", () => {
    const list = [
      rec("a", "2026-05-01", "코니도", ["aphid"]),
      rec("b", "2026-05-10", "세티스", ["aphid"]),
      rec("c", "2026-05-20", "모스피란", ["aphid"]),
    ];
    const issues = checkRecord(list[2], list);
    expect(issues.some((i) => i.kind === "recent" && i.days === 19)).toBe(true);
    expect(levelOf(issues)).toBe("warn");
  });
  it("다점 작용(M)·기계유는 연속이어도 경고 없음", () => {
    const list = [rec("a", "2026-06-01", "다이센엠-45", ["melanose"]), rec("b", "2026-06-15", "안트라콜", ["melanose"])];
    expect(checkRecord(list[1], list)).toEqual([]);
  });
  it("모르는 상품은 코드가 없으면 unknown", () => {
    const r = rec("a", "2026-06-01", "신상품", ["mite"]);
    expect(checkRecord(r, [r])[0].kind).toBe("unknown");
  });
  it("혼합제 코드(+)와 국내 살균제 기호", () => {
    const list = [
      rec("a", "2026-05-01", "신상품A", ["scab"], "1", "다3"),
      rec("b", "2026-06-01", "신상품B", ["scab"], "1", "엠1+다3"),
    ];
    expect(checkRecord(list[1], list)[0]).toMatchObject({ kind: "consecutive", group: "KR 다3" });
    expect(codeFromLabel("4a")).toBe("IRAC 4A");
  });
  it("모르는 상품도 라벨 코드로 점검", () => {
    const list = [rec("a", "2026-04-20", "산마루", ["mite"]), rec("b", "2026-05-01", "신상품", ["mite"], "1", "21A")];
    expect(levelOf(checkRecord(list[1], list))).toBe("bad");
  });
});

describe("recommend", () => {
  it("직전 기작은 맨 뒤(avoid), 미사용이 앞", () => {
    const list = [rec("a", "2026-04-20", "산마루", ["mite"])];
    const { groups } = recommend("mite", list, { onlyJ: true, today: "2026-05-01", priceOf: () => 1 });
    expect(groups[0].status.kind).toBe("unused");
    expect(groups[groups.length - 1]).toMatchObject({ group: "IRAC 21", status: { kind: "avoid" } });
  });
});
