/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Firestore 보안 규칙(firestore.rules) 게시.
 *   npm run rules:deploy -- <서비스계정.json>
 * 또는 GOOGLE_APPLICATION_CREDENTIALS 환경변수로 경로 지정.
 * (firebase CLI 는 이 서비스 계정에 serviceusage 권한이 없어 실패하므로 Admin SDK 로 직접 게시)
 */
const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getSecurityRules } = require("firebase-admin/security-rules");

const keyPath = process.argv[2] || process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!keyPath) {
  console.error("서비스 계정 JSON 경로를 넘겨 주세요: npm run rules:deploy -- C:/path/key.json");
  process.exit(1);
}
const sa = JSON.parse(fs.readFileSync(keyPath, "utf8"));
initializeApp({ credential: cert(sa), projectId: sa.project_id });
const src = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");

getSecurityRules()
  .releaseFirestoreRulesetFromSource(src)
  .then((rs) => console.log(`게시 완료: ${sa.project_id} / ruleset ${rs.name}`))
  .catch((e) => {
    console.error("실패:", e.code || "", e.message);
    process.exit(1);
  });
