"use client";
import { collection, deleteDoc, doc, getDoc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import type { SprayRecord, UserSettings } from "../domain/types";
import type { ProductInfo } from "../psis";
import { cleanRecord, parseLegacy, type DataSource } from "../source";
import { firestore } from "./client";

/*
 * Firestore 구조
 *   users/{uid}                 → UserSettings (prices, orchardNames)
 *   users/{uid}/records/{id}    → SprayRecord
 *   pesticides/{id}, meta/*     → 공용 기준 데이터 (서버만 쓰기)
 */
export function firebaseSource(uid: string): DataSource {
  const recordsCol = () => collection(firestore(), "users", uid, "records");
  const userDoc = () => doc(firestore(), "users", uid);
  let records: SprayRecord[] = [];
  let settings: UserSettings = { prices: {}, orchardNames: {} };

  return {
    kind: "firebase",
    watchRecords(cb, onErr) {
      return onSnapshot(
        recordsCol(),
        (snap) => {
          records = snap.docs.map((d) => ({ ...(d.data() as SprayRecord), id: d.id }));
          cb(records);
        },
        onErr,
      );
    },
    watchSettings(cb, onErr) {
      return onSnapshot(
        userDoc(),
        (snap) => {
          const d = (snap.data() || {}) as Partial<UserSettings>;
          settings = { prices: d.prices || {}, orchardNames: d.orchardNames || {} };
          cb(settings);
        },
        onErr,
      );
    },
    addRecord: (r) => setDoc(doc(recordsCol(), r.id), cleanRecord(r)),
    deleteRecord: (id) => deleteDoc(doc(recordsCol(), id)),
    saveSettings: (patch) => setDoc(userDoc(), patch, { mergeFields: Object.keys(patch) }),
    async importBackup(json) {
      const { fresh, prices, names } = parseLegacy(json, records);
      // 배치 한 번에 500건 제한
      for (let i = 0; i < fresh.length; i += 450) {
        const b = writeBatch(firestore());
        fresh.slice(i, i + 450).forEach((r) => b.set(doc(recordsCol(), r.id), r));
        await b.commit();
      }
      await setDoc(
        userDoc(),
        { prices: { ...settings.prices, ...prices }, orchardNames: { ...settings.orchardNames, ...names } },
        { mergeFields: ["prices", "orchardNames"] },
      );
      return fresh.length;
    },
    async loadProducts() {
      try {
        const s = await getDoc(doc(firestore(), "meta", "citrusProducts"));
        return ((s.data()?.products as ProductInfo[]) || []).filter((p) => p && p.brand);
      } catch {
        return [];
      }
    },
  };
}
