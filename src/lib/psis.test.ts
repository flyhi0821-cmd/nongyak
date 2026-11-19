import { describe, expect, it } from "vitest";
import { parseIndict, parsePsisXml, summarizeProducts } from "./psis";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<service><totalCount>2</totalCount><list>
<item><cropName>감귤</cropName><diseaseWeedName>귤응애</diseaseWeedName><pestiKorName>피리다벤 수화제</pestiKorName>
<pestiBrandName>산마루</pestiBrandName><indictSymbl>21A</indictSymbl><dilutUnit>2000배</dilutUnit><useSuittime>수확 30일 전까지</useSuittime><useNum>2회 이내</useNum><pestiCode>111</pestiCode><diseaseUseSeq>1</diseaseUseSeq></item>
<item><cropName>감귤</cropName><diseaseWeedName>녹응애</diseaseWeedName><pestiKorName>피리다벤 수화제</pestiKorName>
<pestiBrandName>산마루</pestiBrandName><indictSymbl>21A</indictSymbl><pestiCode>111</pestiCode><diseaseUseSeq>2</diseaseUseSeq></item>
</list></service>`;

describe("PSIS", () => {
  it("XML 행을 찾는다", () => {
    const { rows, total, error } = parsePsisXml(XML);
    expect(error).toBeNull();
    expect(total).toBe(2);
    expect(rows).toHaveLength(2);
    expect(rows[0].pestiBrandName).toBe("산마루");
  });
  it("한 행만 와도 배열로", () => {
    const one = XML.replace(/<item>[\s\S]*?<\/item>\n?/, "");
    expect(parsePsisXml(one).rows).toHaveLength(1);
  });
  it("에러 코드 감지", () => {
    expect(parsePsisXml("<service><errorCode>ERR_105</errorCode></service>").error).toBe("ERR_105");
  });
  it("작용기작 표시 파싱", () => {
    expect(parseIndict("21A")).toEqual(["IRAC 21A"]);
    expect(parseIndict("4a+16")).toEqual(["IRAC 4A", "IRAC 16"]);
    expect(parseIndict("다3")).toEqual(["KR 다3"]);
    expect(parseIndict("")).toEqual([]);
  });
  it("상표명별 요약", () => {
    const s = summarizeProducts(parsePsisXml(XML).rows);
    expect(s["산마루"]).toMatchObject({ item: "피리다벤 수화제", codes: ["IRAC 21A"], pests: ["귤응애", "녹응애"], phi: "수확 30일 전까지" });
  });
});
