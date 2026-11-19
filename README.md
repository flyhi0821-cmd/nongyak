# 감귤 방제 수첩 (웹)

Next.js 16 + Firebase(Google 로그인·Firestore) + Vercel. 한국어/English, 시스템·라이트·다크 테마.

## 처음 실행
1. `.env.example` → `.env.local` 복사 후 Firebase 웹 앱 설정값 입력
2. Firebase 콘솔: Authentication → Google 사용 설정, Firestore 데이터베이스 생성
3. `firestore.rules` 내용을 Firestore 규칙에 붙여넣기 (또는 `firebase deploy --only firestore:rules`)
4. `npm install` → `npm run dev` → http://localhost:3000

## 구조
- `src/lib/domain/` 기준 데이터(seed)·작용기작 점검·추천 로직 (`npm test`)
- `src/lib/firebase/` 클라이언트/서버(Admin) 초기화, Firestore 읽기·쓰기
- `src/i18n/` ko·en 사전, `src/proxy.ts` 언어 경로 리다이렉트
- `src/components/app/` 화면 (기록·점검·추천·설정 탭)
- `src/lib/psis.ts`, `src/app/api/pesticides/sync` 농약안전정보시스템 OpenAPI(감귤) → Firestore 동기화 (Vercel Cron 매일, `vercel.json`)
- `src/lib/source.ts` 저장소 추상화: Firebase(로그인) / localStorage(체험 모드)

## 체험 모드
Firebase 설정 없이도 첫 화면의 "로그인 없이 체험하기"로 모든 기능을 써 볼 수 있습니다(이 브라우저에만 저장).

## Vercel 배포
GitHub main 에 push 하면 Vercel 이 자동 배포합니다(저장소 최상위가 Next 앱). `.env.example` 의 변수를 Environment Variables 에 입력.
Firebase Authentication → 승인된 도메인에 Vercel 도메인 추가.

## 이전 버전
`legacy/` 에 단일 HTML 수첩(감귤방제수첩.html)과 백업본이 있습니다.
