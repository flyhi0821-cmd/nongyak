import { adminDb } from "@/lib/firebase/admin";
import { parsePsisXml, PSIS_PAGE, psisListUrl, summarizeProducts, type PsisRow } from "@/lib/psis";

/**
 * 농약안전정보시스템(PSIS) → Firestore 동기화. 감귤 등록 농약만 가져온다.
 *
 * Vercel Cron(vercel.json)이 하루 한 번 GET 으로 부른다. CRON_SECRET 이 설정돼 있으면
 * Vercel 이 `Authorization: Bearer <CRON_SECRET>` 를 붙여 보낸다.
 *
 * 저장
 *   pesticides/{pestiCode}_{diseaseUseSeq}  작물×병해충×품목 원본 행
 *   meta/citrusProducts                     상표명별 요약(앱이 한 번에 읽음)
 *   meta/pesticideSync                      마지막 동기화 결과
 *
 * 환경변수: PSIS_API_KEY, CRON_SECRET, FIREBASE_SERVICE_ACCOUNT_B64
 */
export const maxDuration = 300;

const CROP = "감귤";
const MAX_PAGES = 200; // 50 × 200 = 10,000행 안전장치

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = process.env.PSIS_API_KEY;
  if (!key) return Response.json({ error: "PSIS_API_KEY not set" }, { status: 500 });

  const all: PsisRow[] = [];
  let total: number | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = psisListUrl(key, page * PSIS_PAGE + 1, { cropName: CROP });
    const res = await fetch(url, { cache: "no-store" });
    const text = await res.text();
    if (!res.ok) return Response.json({ error: `upstream ${res.status}`, sample: text.slice(0, 300) }, { status: 502 });
    const { rows, total: tc, error } = parsePsisXml(text);
    if (error) return Response.json({ error: `PSIS ${error}`, sample: text.slice(0, 300) }, { status: 502 });
    total ??= tc;
    all.push(...rows);
    if (rows.length < PSIS_PAGE || (total != null && all.length >= total)) break;
  }

  const db = adminDb();
  // 배치는 500건 제한
  for (let i = 0; i < all.length; i += 450) {
    const batch = db.batch();
    for (const r of all.slice(i, i + 450)) {
      const id = `${r.pestiCode || "x"}_${r.diseaseUseSeq || i}`.replace(/\//g, "-");
      batch.set(db.collection("pesticides").doc(id), { ...r, _syncedAt: new Date() });
    }
    await batch.commit();
  }
  const products = Object.values(summarizeProducts(all));
  await db.doc("meta/citrusProducts").set({ crop: CROP, at: new Date(), products });
  await db.doc("meta/pesticideSync").set({ at: new Date(), rows: all.length, products: products.length, total });

  return Response.json({ ok: true, rows: all.length, products: products.length, total });
}
