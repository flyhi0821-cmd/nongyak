const ko = {
  appTitle: "감귤 방제 수첩",
  appTitleParts: ["감귤 ", "방제", " 수첩"] as [string, string, string],
  appSub: "과원별 살포 달력 · 같은 성분/작용기작 연속 살포 점검 · 다른 기작 농약 추천",
  meta: { description: "감귤 과원 살포 기록과 농약 작용기작 연속 사용 점검" },

  common: {
    orchard: "과원",
    year: "연도",
    all: "전체",
    allOrchards: "전체 과원",
    loading: "불러오는 중…",
    save: "저장",
    delete: "삭제",
    confirmDelete: "삭제 확인",
    failed: "실패",
    noProduct: "상품명 없음",
    noCode: "코드 없음",
    unknownIng: "성분 미확인",
    weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    orchardName: (n: string) => `${n}과원`,
    orchardNone: "과원 미지정",
    won: (n: number) => `${n.toLocaleString("ko-KR")}원`,
    count: (n: number) => `${n}건`,
  },

  theme: { label: "화면 테마", system: "시스템", light: "라이트", dark: "다크" },
  lang: { label: "언어" },

  auth: {
    signIn: "Google로 로그인",
    signOut: "로그아웃",
    heroTitle: "살포 기록을 남기면, 같은 기작 연속 살포를 미리 막아 줍니다",
    heroBody: "과원 6곳의 살포를 달력에 적고, 같은 작용기작(IRAC·FRAC)을 이어 쓰거나 30일 안에 다시 쓰면 바로 알려 줍니다. 다음 살포에 쓸 다른 기작 약제도 추천합니다.",
    heroPoints: ["Google 계정으로 로그인하면 휴대폰·PC 어디서든 같은 기록", "통신이 끊긴 과원에서도 기록, 연결되면 자동 저장", "한국어 · English"],
    notConfigured: "Firebase 설정이 아직 없습니다. web/.env.local 에 Firebase 웹 앱 설정값을 넣고 다시 실행하세요.",
    error: (m: string) => `로그인하지 못했습니다: ${m}`,
  },

  demo: {
    start: "로그인 없이 체험하기",
    note: "체험 모드는 예시 기록으로 시작하고, 이 브라우저에만 저장됩니다.",
    banner: "체험 모드입니다. 기록은 이 브라우저에만 저장됩니다. 기기 간 동기화는 Google 로그인 후에 됩니다.",
    reset: "예시로 되돌리기",
    exit: "체험 끝내기",
  },

  tabs: { log: "살포 기록", check: "내성 점검", rec: "대체 농약 추천", settings: "성분·가격·설정" },

  summary: {
    sprays: (y: number, scope: string) => `${y}년 ${scope} 살포`,
    groups: "사용한 작용기작 그룹",
    bad: "연속 살포(같은 기작)",
    warn: "주의가 필요한 살포",
  },

  status: { ok: "양호", warn: "주의", bad: "연속 기작" },

  cal: {
    title: "과원별 살포 달력",
    hint: "과원을 누르면 그 과원의 살포 달력이 열립니다. 날짜를 눌러 그날 기록을 보고, 그 날짜로 바로 기록할 수 있습니다.",
    monthTitle: (y: number, m: number, o: string) => `${y}년 ${m}월 · ${o}`,
    prev: "‹ 이전",
    next: "다음 ›",
    today: "오늘",
    list: "목록",
    calendar: "달력",
    legendNote: "칸 안의 글자는 상품명입니다",
    dayTitle: (m: number, d: number, wd: string, o: string) => `${m}월 ${d}일 (${wd}) · ${o}`,
    recordThisDay: "이 날짜로 기록하기",
    emptyDay: "이 날은 살포 기록이 없습니다.",
    emptyYear: (y: number, o: string) => `${y}년 ${o} 살포 기록이 없습니다. 아래에서 첫 살포를 기록하세요.`,
    monthGroup: (m: number, n: number) => `${m}월 · ${n}건`,
    dayAria: (d: string, n: number) => (n ? `${d} 살포 ${n}건` : d),
  },

  records: {
    title: "살포 기록",
    expand: "펼쳐 보기",
    collapse: "접기",
    empty: "아직 기록이 없습니다. 위에서 과원, 상품명, 방제 대상을 골라 첫 살포를 기록하세요.",
    weekday: (wd: string) => `${wd}요일`,
  },

  form: {
    title: "살포 기록 추가",
    titleFor: (o: string) => `살포 기록 추가 · ${o}`,
    date: "살포일",
    product: "상품명",
    productPh: "예: 산마루, 슈퍼펀치",
    codeLabel: "목록에 없는 상품입니다. 병 앞면의 작용기작 표시를 적으면 점검됩니다 (선택)",
    codePh: "예: 21A",
    pests: "방제 대상 (여러 개 선택 가능)",
    saveBtn: "기록 저장",
    unknownProduct: (n: string) => `'${n}'은(는) 목록에 없는 상품입니다. 그대로 저장할 수 있지만, 작용기작 표시를 적어야 연속 살포 점검이 됩니다.`,
    previewHead: (o: string) => `저장 전 점검 (${o})`,
    previewOk: (o: string) => `저장 전 점검: ${o}에서 같은 대상에 성분·작용기작이 겹치지 않습니다.`,
    missing: (f: string[]) => `${f.join(", ")}을(를) 넣어 주세요.`,
    missingOrchard: "과원(달력 위 버튼)",
    saved: (o: string, m: number, d: number) => `${o} ${m}월 ${d}일에 저장했습니다.`,
    saveFailed: (m: string) => `저장하지 못했습니다: ${m}`,
    apiFound: (brand: string, item: string, codes: string) => `${brand} → ${item} (작용기작 ${codes || "표시 없음"}) · 농약안전정보시스템 등록 정보`,
    apiSafety: (dilut: string, phi: string, uses: string) =>
      [dilut && `희석 ${dilut}`, phi && `안전사용: ${phi}`, uses && uses].filter(Boolean).join(" · "),
  },

  issue: {
    unknown: (p: string) => `'${p}'의 성분을 몰라 점검하지 못했습니다. 병 앞면의 작용기작 표시를 기록에 넣어 주세요.`,
    consecutive: (pest: string, date: string, prod: string, g: string, ing: string) =>
      `${pest}: 직전 살포(${date} ${prod})와 같은 작용기작 ${g}입니다. ${ing}은(는) 연속으로 쓰지 마세요.`,
    recent: (pest: string, days: number, prod: string, g: string) => `${pest}: ${days}일 전(${prod})에 같은 작용기작 ${g}을 썼습니다.`,
    yearCount: (pest: string, g: string, n: number, max: number) =>
      `${pest}: 올해 이 과원에서 ${g} 계열 ${n}번째 살포입니다. 한 해 ${max}회 이하를 권장합니다.`,
    sameIngredient: (pest: string, ing: string, n: number) => `${pest}: 같은 성분 ${ing}을(를) 올해 ${n}번째 사용합니다.`,
  },

  check: {
    title: "해충·병해별 작용기작 사용 순서",
    note: "같은 대상에 같은 작용기작 그룹(번호가 같으면 같은 계열)이 이어지면 빨간색, 30일 이내 재사용이거나 한 해 2회 이상이면 노란색입니다.",
    resultTitle: "점검 결과",
    empty: "이 연도 기록이 없습니다.",
    allOk: "같은 성분·작용기작이 연속되거나 몰린 살포가 없습니다.",
  },

  rec: {
    title: "다음 살포에 쓸 수 있는 다른 작용기작",
    target: "대상",
    onlyJ: "방제도감 수록 약제만",
    last: (scope: string, pest: string, date: string, prod: string, ings: string) =>
      `${scope} ${pest} 최근 살포: ${date} ${prod} (${ings}). 다음에는 아래 추천 그룹에서 고르세요.`,
    none: (y: number, scope: string, pest: string) =>
      `${y}년 ${scope} ${pest} 살포 기록이 없습니다. 어떤 그룹이든 쓸 수 있지만 이후에는 그룹을 바꿔 가며 쓰세요.`,
    tipPickOrchard: " 과원별로 보려면 맨 위에서 과원을 고르세요.",
    noCands: (pest: string, onlyJ: boolean) =>
      `${pest}에 대해 방제도감에서 감귤용으로 확인된 약제를 찾지 못했습니다. 농약안전정보시스템에서 '감귤'과 '${pest}'로 검색해 등록 약제를 확인하세요.` +
      (onlyJ ? " 위 체크를 끄면 미확인 후보도 볼 수 있습니다." : ""),
    st: {
      unused: "올해 미사용 · 추천",
      usable: (d: string) => `${d} 사용 · 사용 가능`,
      recent: (n: number) => `${n}일 전 사용`,
      lowRisk: "저항성 위험 낮음 · 보조용",
      overused: (n: number) => `올해 ${n}회 사용 · 자제`,
      avoid: "직전 사용 · 피하세요",
    },
    products: "상품",
    targets: "대상",
    mix: "혼합제",
    unknownProduct: "상품명 미확인",
    priceUser: "입력가",
    priceEst: "추정가",
  },

  src: { J: "방제도감 수록", U: "감귤 등록 미확인", Jshort: "수록", Ushort: "미확인" },

  settings: {
    priceTitle: "성분·작용기작·참고 가격",
    priceNote: "가격은 공식 자료가 없어 추정한 값입니다. 농협·농약사에서 산 실제 가격으로 고치면 '입력가'로 표시되고 추천 화면에도 반영됩니다.",
    cols: ["성분", "코드", "상품명(방제도감)", "확인", "대상", "포장", "가격(원)"],
    resetPrices: "입력한 가격 모두 지우기",
    pricesSaved: "가격을 저장했습니다.",
    pricesReset: "입력한 가격을 지웠습니다.",
    mixPrefix: "혼합",
    sourcesTitle: "자료 출처와 표시 기준",
    sources: [
      "방제도감 수록: 제주특별자치도농업기술원 「농업인이 궁금해하는 감귤 병해충 방제도감」에 감귤 방제 약제로 실린 성분입니다.",
      "감귤 등록 미확인: 위 자료에서 감귤용으로 찾지 못한 성분입니다. 쓰기 전에 반드시 등록 여부를 확인하세요.",
      "희석배수, 수확 전 사용 시기·횟수는 제품 라벨과 농약안전정보시스템 농약안전사용기준에서 확인하세요.",
      "작용기작 코드(IRAC·FRAC)는 국제 분류 기준을 따랐습니다. 번호가 같으면 알파벳이 달라도 같은 계열로 봅니다.",
      "FRAC M(다점 작용) 계열과 기계유는 저항성 위험이 낮아 연속 살포 경고에서 제외합니다.",
    ],
    psisLink: "농약안전정보시스템 열기",
    orchardTitle: "과원 이름",
    orchardNote: "알아보기 쉬운 이름으로 바꿔 두면 기록과 점검 화면에 그 이름이 나옵니다.",
    orchardLabel: (n: string) => `${n}번 과원`,
    orchardSaved: "과원 이름을 저장했습니다.",
    importTitle: "이전 수첩(HTML) 기록 가져오기",
    importNote: "예전 감귤방제수첩.html 의 '백업 복사'로 얻은 글자를 붙여넣으세요. 이미 있는 기록은 건너뜁니다.",
    importBtn: "가져오기",
    imported: (n: number) => `기록 ${n}건을 가져왔습니다.`,
    importBad: "백업 형식이 올바르지 않습니다.",
    exportBtn: "내 기록 백업 복사",
    copied: "복사했습니다.",
  },
};

export default ko;
export type Dict = typeof ko;
