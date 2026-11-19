"use client";
import type { SprayRecord, UserSettings } from "./domain/types";
import { cleanRecord, parseLegacy, type DataSource } from "./source";

const KEY = "citrus-demo-v1";

function sample(): SprayRecord[] {
  const y = new Date().getFullYear();
  const r = (id: string, md: string, orchard: string, pests: string[], product: string): SprayRecord => ({
    id, date: `${y}-${md}`, orchard, pests, product, created: 0,
  });
  return [
    r("s1", "04-20", "1", ["mite"], "산마루"),
    r("s2", "05-25", "1", ["aphid"], "코니도"),
    r("s3", "06-15", "1", ["mite"], "피라니카"),
    r("s4", "06-15", "2", ["melanose"], "다이센엠-45"),
    r("s5", "07-10", "2", ["scale", "thrips"], "슈퍼펀치"),
    r("s6", "08-20", "2", ["mite"], "가네마이트"),
    r("s7", "09-15", "3", ["thrips"], "섹큐어"),
  ];
}

interface State { records: SprayRecord[]; settings: UserSettings }

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<State>;
      return { records: d.records || [], settings: { prices: {}, orchardNames: {}, ...(d.settings || {}) } };
    }
  } catch {}
  return { records: sample(), settings: { prices: {}, orchardNames: {} } };
}

/** 체험 모드: 이 브라우저에만 저장. 처음엔 예시 기록이 들어 있다. */
export function localSource(): DataSource {
  let state = load();
  const recL = new Set<(r: SprayRecord[]) => void>();
  const setL = new Set<(s: UserSettings) => void>();
  const commit = (next: State) => {
    state = next;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    recL.forEach((f) => f(state.records));
    setL.forEach((f) => f(state.settings));
  };
  return {
    kind: "local",
    watchRecords(cb) {
      recL.add(cb);
      queueMicrotask(() => cb(state.records));
      return () => recL.delete(cb);
    },
    watchSettings(cb) {
      setL.add(cb);
      queueMicrotask(() => cb(state.settings));
      return () => setL.delete(cb);
    },
    async addRecord(r) {
      commit({ ...state, records: [...state.records.filter((x) => x.id !== r.id), cleanRecord(r)] });
    },
    async deleteRecord(id) {
      commit({ ...state, records: state.records.filter((x) => x.id !== id) });
    },
    async saveSettings(patch) {
      commit({ ...state, settings: { ...state.settings, ...patch } });
    },
    async importBackup(json) {
      const { fresh, prices, names } = parseLegacy(json, state.records);
      commit({
        records: [...state.records, ...fresh],
        settings: { prices: { ...state.settings.prices, ...prices }, orchardNames: { ...state.settings.orchardNames, ...names } },
      });
      return fresh.length;
    },
    async loadProducts() {
      return [];
    },
  };
}

export function resetDemo() {
  try { localStorage.removeItem(KEY); } catch {}
}
