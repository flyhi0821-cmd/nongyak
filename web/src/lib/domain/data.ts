/**
 * 기준 데이터 (seed).
 * 출처: 제주특별자치도농업기술원 「농업인이 궁금해하는 감귤 병해충 방제도감」.
 * 농약 API 동기화가 붙으면 Firestore `pesticides` 컬렉션 값이 이 seed를 덮어쓴다.
 * 작용기작 코드(IRAC·FRAC)는 국제 분류를 따르며 API에 없을 때 이 seed로 채운다.
 */
import type { Localized } from "./types";

export type PestId =
  | "mite" | "rust" | "scale" | "aphid" | "thrips" | "miner" | "white"
  | "melanose" | "scab" | "canker" | "gray";

export interface Pest {
  id: PestId;
  name: Localized;
  type: "insect" | "disease";
}

export const PESTS: Pest[] = [
  { id: "mite", name: { ko: "귤응애", en: "Citrus red mite" }, type: "insect" },
  { id: "rust", name: { ko: "녹응애", en: "Citrus rust mite" }, type: "insect" },
  { id: "scale", name: { ko: "깍지벌레", en: "Scale insects" }, type: "insect" },
  { id: "aphid", name: { ko: "진딧물", en: "Aphids" }, type: "insect" },
  { id: "thrips", name: { ko: "총채벌레", en: "Thrips" }, type: "insect" },
  { id: "miner", name: { ko: "귤굴나방", en: "Citrus leafminer" }, type: "insect" },
  { id: "white", name: { ko: "가루이", en: "Whiteflies" }, type: "insect" },
  { id: "melanose", name: { ko: "검은점무늬병", en: "Melanose" }, type: "disease" },
  { id: "scab", name: { ko: "더뎅이병", en: "Citrus scab" }, type: "disease" },
  { id: "canker", name: { ko: "궤양병", en: "Citrus canker" }, type: "disease" },
  { id: "gray", name: { ko: "잿빛곰팡이병", en: "Gray mold" }, type: "disease" },
];
export const PEST_BY_ID = Object.fromEntries(PESTS.map((p) => [p.id, p])) as Record<PestId, Pest>;

/** 작용기작 그룹 설명 */
export const MOA: Record<string, Localized> = {
  "IRAC 1": { ko: "아세틸콜린에스터레이스 저해 (유기인계)", en: "Acetylcholinesterase inhibitors (organophosphates)" },
  "IRAC 3": { ko: "나트륨 채널 조절 (피레스로이드계)", en: "Sodium channel modulators (pyrethroids)" },
  "IRAC 4": { ko: "니코틴성 수용체 작용 (네오니코티노이드·설폭시민·뷰테놀라이드)", en: "Nicotinic receptor modulators (neonicotinoids, sulfoximines, butenolides)" },
  "IRAC 5": { ko: "니코틴성 수용체 알로스테릭 (스피노신계)", en: "Nicotinic receptor allosteric modulators (spinosyns)" },
  "IRAC 6": { ko: "염화이온 채널 활성 (아버멕틴·밀베마이신계)", en: "Chloride channel activators (avermectins, milbemycins)" },
  "IRAC 7": { ko: "유약호르몬 모방", en: "Juvenile hormone mimics" },
  "IRAC 9": { ko: "현음기관 조절 (피리딘아조메틴)", en: "Chordotonal organ modulators (pyridine azomethines)" },
  "IRAC 10": { ko: "응애 생장 저해", en: "Mite growth inhibitors" },
  "IRAC 12": { ko: "ATP 합성효소 저해", en: "ATP synthase inhibitors" },
  "IRAC 13": { ko: "산화적 인산화 탈공역", en: "Uncouplers of oxidative phosphorylation" },
  "IRAC 15": { ko: "키틴 생합성 저해 (나비목)", en: "Chitin biosynthesis inhibitors (Lepidoptera)" },
  "IRAC 16": { ko: "키틴 생합성 저해 (매미목)", en: "Chitin biosynthesis inhibitors (Hemiptera)" },
  "IRAC 19": { ko: "옥토파민 수용체 작용 (아미트라즈)", en: "Octopamine receptor agonists (amitraz)" },
  "IRAC 20": { ko: "미토콘드리아 복합체 III 저해", en: "Mitochondrial complex III inhibitors" },
  "IRAC 21": { ko: "미토콘드리아 복합체 I 저해 (METI)", en: "Mitochondrial complex I inhibitors (METI)" },
  "IRAC 23": { ko: "지질 생합성 저해 (테트론산·테트람산)", en: "Lipid synthesis inhibitors (tetronic/tetramic acids)" },
  "IRAC 25": { ko: "미토콘드리아 복합체 II 저해", en: "Mitochondrial complex II inhibitors" },
  "IRAC 28": { ko: "라이아노딘 수용체 조절 (디아마이드계)", en: "Ryanodine receptor modulators (diamides)" },
  "IRAC 29": { ko: "현음기관 조절 (플로니카미드)", en: "Chordotonal organ modulators (flonicamid)" },
  UN: { ko: "물리적 피막 (기계유)", en: "Physical film (mineral oil)" },
  "FRAC 1": { ko: "세포분열 저해 (벤지미다졸계)", en: "Mitosis inhibitors (benzimidazoles)" },
  "FRAC 3": { ko: "에르고스테롤 생합성 저해 (트리아졸계)", en: "Ergosterol biosynthesis inhibitors (triazoles)" },
  "FRAC 7": { ko: "숙신산 탈수소효소 저해 (SDHI)", en: "Succinate dehydrogenase inhibitors (SDHI)" },
  "FRAC 9": { ko: "메티오닌 생합성 저해 (아닐리노피리미딘)", en: "Methionine biosynthesis inhibitors (anilinopyrimidines)" },
  "FRAC 11": { ko: "호흡 복합체 III 저해 (스트로빌루린계)", en: "Complex III Qo inhibitors (strobilurins)" },
  "FRAC 12": { ko: "신호전달 저해 (페닐피롤)", en: "Signal transduction inhibitors (phenylpyrroles)" },
  "FRAC 17": { ko: "스테롤 C4 탈메틸 저해", en: "Sterol C4-demethylation inhibitors" },
  "FRAC 24": { ko: "단백질 합성 저해 (가스가마이신)", en: "Protein synthesis inhibitors (kasugamycin)" },
  "FRAC 25": { ko: "단백질 합성 저해 (스트렙토마이신)", en: "Protein synthesis inhibitors (streptomycin)" },
  "FRAC 29": { ko: "산화적 인산화 탈공역 (플루아지남)", en: "Uncouplers of oxidative phosphorylation (fluazinam)" },
  "FRAC 41": { ko: "단백질 합성 저해 (테트라사이클린)", en: "Protein synthesis inhibitors (tetracycline)" },
  "FRAC M1": { ko: "다점 작용 (구리)", en: "Multi-site (copper)" },
  "FRAC M3": { ko: "다점 작용 (디티오카바메이트)", en: "Multi-site (dithiocarbamates)" },
  "FRAC M7": { ko: "다점 작용 (구아니딘)", en: "Multi-site (guanidines)" },
  "FRAC M9": { ko: "다점 작용 (퀴논)", en: "Multi-site (quinones)" },
};

/** J = 방제도감 수록, U = 감귤 등록 미확인 */
export type Source = "J" | "U";

export interface Ingredient {
  id: string;
  name: Localized;
  code: string;
  /** 대표 상품명, '·'로 구분 */
  product: string;
  unit: string;
  /** 추정 소매가(원) */
  price: number;
  targets: PestId[];
  src: Source;
  note: Localized | null;
}

type Row = [string, string, string, string, string, string, number, PestId[], Source, string?, string?];

// [id, 성분(ko), 성분(en), 코드, 대표 상품명, 포장, 추정가, 대상, 출처, 비고(ko), 비고(en)]
const ROWS: Row[] = [
  ["oil", "기계유", "Mineral oil", "UN", "기계유유제", "18L", 55000, ["mite", "scale"], "J"],
  ["acq", "아세퀴노실", "Acequinocyl", "IRAC 20B", "가네마이트", "500ml", 28000, ["mite"], "J"],
  ["bfz", "비페나제이트", "Bifenazate", "IRAC 20D", "아크라마이트", "500ml", 30000, ["mite"], "J", "에톡사졸·스피로메시펜과의 혼합제도 있음", "Also sold mixed with etoxazole or spiromesifen"],
  ["tbp", "테부펜피라드", "Tebufenpyrad", "IRAC 21A", "피라니카", "500ml", 20000, ["mite"], "J"],
  ["pdb", "피리다벤", "Pyridaben", "IRAC 21A", "산마루", "500g", 18000, ["mite", "rust"], "J", "녹응애·차먼지응애에도 수록", "Also listed for rust mite and broad mite"],
  ["fnq", "페나자퀸", "Fenazaquin", "IRAC 21A", "보라매·응애단", "500ml", 20000, ["mite"], "J", "헥시티아족스 혼합제(응애도사)도 있음", "Also sold mixed with hexythiazox (Eungaedosa)"],
  ["spd", "스피로디클로펜", "Spirodiclofen", "IRAC 23", "엔비도", "500ml", 30000, ["mite", "rust"], "J"],
  ["spm", "스피로메시펜", "Spiromesifen", "IRAC 23", "코드윈·지존", "500ml", 30000, ["mite"], "J"],
  ["cyp", "사이에노피라펜", "Cyenopyrafen", "IRAC 25A", "쇼크·선캡·집중마크", "500ml", 32000, ["mite"], "J"],
  ["etx", "에톡사졸", "Etoxazole", "IRAC 10B", "주움", "500ml", 25000, ["mite"], "J"],
  ["hxt", "헥시티아족스", "Hexythiazox", "IRAC 10A", "", "500ml", 22000, ["mite"], "J", "단제가 아닌 혼합제로 수록", "Listed only as a mixture"],
  ["amt", "아미트라즈", "Amitraz", "IRAC 19", "마이탁", "500ml", 18000, ["mite"], "J", "녹응애용으로도 안내됨", "Also recommended for rust mite"],
  ["ppg", "프로파자이트", "Propargite", "IRAC 12C", "오마이트", "500g", 18000, ["mite"], "J"],
  ["mbm", "밀베멕틴", "Milbemectin", "IRAC 6", "밀베노크", "500ml", 28000, ["mite"], "J"],
  ["abm", "아바멕틴", "Abamectin", "IRAC 6", "올스타", "500ml", 18000, ["mite", "thrips"], "J", "총채·깍지에는 설폭사플로르 혼합제(슈퍼펀치)로 수록", "Listed for thrips/scale as a sulfoxaflor mixture (Super Punch)"],
  ["flz", "플루아지남", "Fluazinam", "FRAC 29", "후론사이드", "500g", 18000, ["rust"], "J", "녹응애 방제용으로 수록", "Listed for rust mite control"],
  ["cfp", "클로르페나피르", "Chlorfenapyr", "IRAC 13", "섹큐어·렘페이지", "500ml", 22000, ["thrips"], "J"],
  ["imi", "이미다클로프리드", "Imidacloprid", "IRAC 4A", "코니도", "500ml", 12000, ["aphid", "thrips"], "J"],
  ["acm", "아세타미프리드", "Acetamiprid", "IRAC 4A", "모스피란·젠토렌", "500g", 15000, ["aphid", "thrips"], "J"],
  ["dnt", "디노테퓨란", "Dinotefuran", "IRAC 4A", "오신·보스", "500g", 20000, ["aphid", "thrips", "scale"], "J", "깍지에는 뷰프로페진 혼합제(검객)로 수록", "Listed for scale as a buprofezin mixture (Geomgaek)"],
  ["sfx", "설폭사플로르", "Sulfoxaflor", "IRAC 4C", "트랜스폼·스트레이트", "500ml", 25000, ["aphid", "scale", "thrips"], "J"],
  ["bpf", "뷰프로페진", "Buprofezin", "IRAC 16", "", "500g", 18000, ["scale", "thrips"], "J", "디노테퓨란·아세타미프리드·설폭사플로르 혼합제로 수록", "Listed as mixtures with dinotefuran, acetamiprid or sulfoxaflor"],
  ["flo", "플로니카미드", "Flonicamid", "IRAC 29", "세티스", "250g", 25000, ["aphid"], "J"],
  ["spt", "스피네토람", "Spinetoram", "IRAC 5", "", "500ml", 25000, ["aphid"], "J", "혼합제로 수록", "Listed as a mixture"],
  ["sps", "스피노사드", "Spinosad", "IRAC 5", "부메랑", "500ml", 22000, ["thrips"], "J"],
  ["lfn", "루페뉴론", "Lufenuron", "IRAC 15", "매치", "500ml", 15000, ["thrips"], "J"],
  ["fpx", "펜피록시메이트", "Fenpyroximate", "IRAC 21A", "", "500ml", 22000, ["mite"], "U"],
  ["cfm", "사이플루메토펜", "Cyflumetofen", "IRAC 25A", "", "500ml", 30000, ["mite"], "U"],
  ["stm", "스피로테트라맷", "Spirotetramat", "IRAC 23", "", "500ml", 35000, ["scale", "aphid", "white"], "U"],
  ["mtd", "메티다티온", "Methidathion", "IRAC 1B", "", "500ml", 15000, ["scale"], "U"],
  ["ppf", "피리프록시펜", "Pyriproxyfen", "IRAC 7C", "", "500ml", 25000, ["scale", "white"], "U"],
  ["pym", "피메트로진", "Pymetrozine", "IRAC 9B", "", "500g", 18000, ["aphid", "white"], "U"],
  ["fpd", "플루피라디퓨론", "Flupyradifurone", "IRAC 4D", "", "500ml", 30000, ["aphid", "white"], "U"],
  ["emb", "에마멕틴벤조에이트", "Emamectin benzoate", "IRAC 6", "", "500ml", 15000, ["thrips", "miner"], "U"],
  ["cyt", "시안트라닐리프롤", "Cyantraniliprole", "IRAC 28", "", "500ml", 30000, ["thrips", "miner", "white"], "U"],
  ["cat", "클로란트라닐리프롤", "Chlorantraniliprole", "IRAC 28", "", "500ml", 30000, ["miner"], "U"],
  ["bft", "비펜트린", "Bifenthrin", "IRAC 3A", "", "500ml", 12000, ["thrips", "aphid"], "U"],
  ["mcz", "만코제브", "Mancozeb", "FRAC M3", "다이센엠-45", "500g", 10000, ["melanose", "rust"], "J", "녹응애 억제용으로도 안내됨", "Also recommended to suppress rust mite"],
  ["ppn", "프로피네브", "Propineb", "FRAC M3", "안트라콜", "500g", 10000, ["melanose", "scab"], "J"],
  ["mtr", "메티람", "Metiram", "FRAC M3", "썬업·포리람", "500g", 12000, ["melanose", "scab"], "J"],
  ["dtn", "디티아논", "Dithianon", "FRAC M9", "델란", "500g", 15000, ["melanose", "scab"], "J"],
  ["pcs", "피라클로스트로빈", "Pyraclostrobin", "FRAC 11", "카브리오", "500ml", 25000, ["melanose", "scab", "gray"], "J", "보스칼리드 혼합제(벨리스플러스)도 있음", "Also sold mixed with boscalid (Bellis Plus)"],
  ["tfs", "트리플록시스트로빈", "Trifloxystrobin", "FRAC 11", "프린트", "500ml", 25000, ["melanose", "scab", "gray"], "J"],
  ["krm", "크레속심메틸", "Kresoxim-methyl", "FRAC 11", "스트로비", "500ml", 20000, ["scab"], "J"],
  ["dfc", "디페노코나졸", "Difenoconazole", "FRAC 3", "푸르겐·로티플", "500ml", 20000, ["scab"], "J"],
  ["tpm", "티오파네이트메틸", "Thiophanate-methyl", "FRAC 1", "톱신엠", "500g", 12000, ["scab"], "J"],
  ["cpd", "시프로디닐", "Cyprodinil", "FRAC 9", "유닉스", "500g", 22000, ["scab", "gray"], "J"],
  ["bsc", "보스칼리드", "Boscalid", "FRAC 7", "", "500g", 25000, ["scab", "gray"], "J", "피라클로스트로빈 혼합제로 수록", "Listed as a pyraclostrobin mixture"],
  ["imn", "이미녹타딘", "Iminoctadine", "FRAC M7", "삼진왕", "500ml", 20000, ["gray"], "J"],
  ["fdx", "플루디옥소닐", "Fludioxonil", "FRAC 12", "사파이어", "500ml", 25000, ["gray"], "J"],
  ["cuh", "수산화구리", "Copper hydroxide", "FRAC M1", "코사이드·쿠퍼", "500g", 15000, ["canker", "scab"], "J", "8월 고온기 약해 주의", "Risk of phytotoxicity in August heat"],
  ["stp", "스트렙토마이신", "Streptomycin", "FRAC 25", "아그렙토·농용신·부라마이신", "500g", 15000, ["canker"], "J", "저항성 우려로 구리제 위주 권장", "Prefer copper products due to resistance concerns"],
  ["otc", "옥시테트라사이클린", "Oxytetracycline", "FRAC 41", "", "500g", 15000, ["canker"], "J", "스트렙토마이신 혼합제로 수록", "Listed as a streptomycin mixture"],
  ["cus", "염기성황산구리", "Basic copper sulfate", "FRAC M1", "네오보르도·새빈나", "500g", 15000, ["canker", "scab"], "J", "8월 고온기 약해 주의", "Risk of phytotoxicity in August heat"],
  ["cuo", "코퍼옥시클로라이드", "Copper oxychloride", "FRAC M1", "", "500g", 15000, ["canker"], "J", "가스가마이신 혼합제(가스란)로 수록", "Listed as a kasugamycin mixture (Gasran)"],
  ["ksg", "가스가마이신", "Kasugamycin", "FRAC 24", "", "500g", 15000, ["canker"], "J", "구리 혼합제(가스란)로 수록", "Listed as a copper mixture (Gasran)"],
  ["fhx", "펜헥사미드", "Fenhexamid", "FRAC 17", "", "500ml", 25000, ["gray"], "U"],
];

export const INGREDIENTS: Ingredient[] = ROWS.map(
  ([id, ko, en, code, product, unit, price, targets, src, noteKo, noteEn]) => ({
    id,
    name: { ko, en },
    code,
    product,
    unit,
    price,
    targets,
    src,
    note: noteKo ? { ko: noteKo, en: noteEn ?? noteKo } : null,
  }),
);
export const ING_BY_ID: Record<string, Ingredient> = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

/** 방제도감에 실린 혼합제: 상품명 → 성분 id 목록 */
export const MIXES: Record<string, string[]> = {
  응애도사: ["fnq", "hxt"],
  슈퍼펀치: ["abm", "sfx"],
  검객: ["bpf", "dnt"],
  바람탄: ["acm", "bpf"],
  당찬: ["acm", "spt"],
  벨리스플러스: ["bsc", "pcs"],
  아그리마이신: ["otc", "stp"],
  가스란: ["cuo", "ksg"],
  보르도액: ["cus"],
};
