// Task 2 — 밸런스 검증 (증인 경로 탐색 + 난이도 샘플링)
//
// 방법론: 3^14 전수 DP는 상태공간이 ~2,400만 개로 비현실적이므로(실측 epoch 11에서 539만),
// 각 성질에 대해 증인 경로(witness path)를 구성한다. "경로가 존재한다"를 보이려면
// 경로 하나가 증명하는 것이 전수 탐색보다 강한 증거이다.
import fs from 'node:fs';
import { EPOCHS, STAT_KEYS, STAT_INIT, RESCUES, RADIATIONS, ENDINGS, FAIL_MAX, ATTRITION, RESCUE_GRACE, RESCUE_HEAL } from './data.mjs';

const clamp = (v) => Math.max(0, Math.min(100, v));
const ap = (s, d) => { const n = { ...s }; for (const k of STAT_KEYS) if (d[k]) n[k] = clamp(n[k] + d[k]); return n; };
const sc = (s, w) => STAT_KEYS.reduce((a, k) => a + s[k] * w[k], 0);
const archeOf = (s) => STAT_KEYS.reduce((a, b) => (s[a] >= s[b] ? a : b));
const tierOf = (f) => (f >= FAIL_MAX ? 'extinct' : f === 0 ? 'perfect' : 'scarred');
const healDeltas = (rd, heal) => {
  const o = {};
  for (const k of STAT_KEYS) if (rd[k]) o[k] = rd[k] < 0 ? -Math.round(Math.abs(rd[k]) * (1 - heal)) : rd[k];
  return o;
};
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// 한 경로 플레이. 정책은 {ci, r} 반환 (r: 0~1 구원 선택 비율, 'skip' = 구원 안 함)
function playPath(policy, seed) {
  const R = rng(seed);
  let stats = { ...STAT_INIT }, fail = 0, grace = 0, log = [];
  for (let i = 0; i < EPOCHS.length; i++) {
    const ep = EPOCHS[i];
    stats = ap(stats, Object.fromEntries(STAT_KEYS.map((k) => [k, -ATTRITION])));
    const d = policy({ stats, ep, fail, grace, R, i });
    const ci = Math.max(0, Math.min(ep.choices.length - 1, d.ci));
    let after = ap(stats, ep.choices[ci].deltas);
    const v = sc(after, ep.w);
    let survived = v >= ep.threshold;
    if (!survived && grace > 0) { survived = true; grace--; } // 구원 유예
    log.push({ ep: ep.id, ci, v: +v.toFixed(1), survived, graceUsed: grace > 0 && v < ep.threshold });
    if (!survived) {
      fail++;
      if (d.r !== 'skip') {
        after = ap(after, healDeltas(RESCUES[Math.min(2, Math.floor(d.r * 3))].deltas, RESCUE_HEAL));
        grace = RESCUE_GRACE;
      }
    }
    stats = after;
    if (fail >= FAIL_MAX) return { stats, fail, log, ended: 'extinct', i };
  }
  return { stats, fail, log, ended: 'survived', i: EPOCHS.length };
}

// ---------- 검증 1: 완전 멸종 증인 ----------
const worstPolicy = (ctx) => {
  const { stats, ep } = ctx;
  let wi = 0, wg = 1e9;
  ep.choices.forEach((c, i) => { const g = sc(ap(stats, c.deltas), ep.w); if (g < wg) { wg = g; wi = i; } });
  return { ci: wi, r: 0 };
};
const extinctWitness = playPath(worstPolicy, 1);

// ---------- 검증 2: 전 에포크 무사 통과 증인 ----------
const greedyPolicy = (ctx) => {
  const { stats, ep } = ctx;
  let bi = 0, bg = -1e9;
  ep.choices.forEach((c, i) => { const g = sc(ap(stats, c.deltas), ep.w); if (g > bg) { bg = g; bi = i; } });
  return { ci: bi, r: 0 };
};
let perfectWitness = null;
for (let s = 1; s <= 6000 && !perfectWitness; s++) { const r = playPath(greedyPolicy, s); if (r.fail === 0 && r.ended === 'survived') perfectWitness = r; }

// ---------- 검증 3: 별도 스크립트(scripts/verify3.mjs) 에서 검증 ----------
// (12,000회 정책 혼합 플레이로 12조합 커버리지 증명 — 중복 실행 방지)

// ---------- 검증 4: 난이도 ----------
const rand = { runs: 12000, failSum: 0, perfect: 0, scarred: 0, extinct: 0, ar: {} };
for (let run = 0; run < rand.runs; run++) {
  const r = playPath(({ R }) => ({ ci: Math.floor(R() * 3), r: 0.7 }), run * 13 + 5);
  rand.failSum += r.fail;
  rand[tierOf(r.fail)]++;
  const a = archeOf(r.stats); rand.ar[a] = (rand.ar[a] || 0) + 1;
}

// ---------- 검증 5: 구원 무효성 ----------
const rescueAllNegative = RESCUES.every((r) => STAT_KEYS.some((k) => (r.deltas[k] || 0) < 0));
const rescueRefundPossible = RESCUES.some((r) => {
  const h = healDeltas(r.deltas, RESCUE_HEAL);
  return STAT_KEYS.reduce((s, k) => s + (h[k] || 0), 0) > 0;
});

// ---------- 검증 6: 결정론 ----------
const dk = (r) => JSON.stringify({ f: r.fail, s: r.stats, l: r.log });
const d1 = playPath(({ R }) => ({ ci: Math.floor(R() * 3), r: 0.5 }), 777);
const d2 = playPath(({ R }) => ({ ci: Math.floor(R() * 3), r: 0.5 }), 777);
const detOk = dk(d1) === dk(d2);

// ---------- 검증 7: 방산 커버리지 ----------
const massEpochs = EPOCHS.filter((e) => e.mass);
const radOk = massEpochs.every((e) => Array.isArray(RADIATIONS[e.id]) && RADIATIONS[e.id].length === 3);

// ---------- 검증 8: 트레이드오프 정합 ----------
const tradeBad = [];
EPOCHS.forEach((ep) => ep.choices.forEach((ch, ci) => {
  const u = STAT_KEYS.filter((k) => (ch.deltas[k] || 0) > 0).length;
  const d = STAT_KEYS.filter((k) => (ch.deltas[k] || 0) < 0).length;
  if (u < 2 || d < 1) tradeBad.push(`ep${ep.id}.c${ci}`);
}));

// ---------- 검증 9: 엔딩 데이터 정합 (12종 × ENDINGS 키) ----------
const endingKeys = [];
['perfect', 'scarred', 'extinct'].forEach((t) => STAT_KEYS.forEach((a) => endingKeys.push(`${t}/${a}`)));
const endingMissing = endingKeys.filter((k) => { const [t, a] = k.split('/'); return !ENDINGS[t] || !ENDINGS[t][a]; });

// ---------- 검증 10: 난이도 구간 ----------
const pR = rand.perfect / rand.runs, sR = rand.scarred / rand.runs, eR = rand.extinct / rand.runs;
const diffOk = pR >= 0.30 && pR <= 0.58 && eR >= 0.08 && eR <= 0.28 && sR >= 0.20;

// 검증3 결과 읽기
let v3 = { pass: false, cov: '미실행' };
try {
  const txt = fs.readFileSync(new URL('./verify3.result.json', import.meta.url), 'utf8');
  v3 = JSON.parse(txt);
} catch (e) {}

const out = {
  밸런스상수: { ATTRITION, RESCUE_GRACE, RESCUE_HEAL, thresholds: EPOCHS.map((e) => e.threshold) },
  검증1_완전멸종증인: { ok: extinctWitness.ended === 'extinct', 실패횟수: extinctWitness.fail, 멸종에포크: extinctWitness.i + 1 },
  검증2_전통과증인: { ok: !!perfectWitness, 최종스탯: perfectWitness ? STAT_KEYS.map((k) => `${k}=${perfectWitness.stats[k]}`).join(' ') : null },
  검증3_엔딩12종: { ok: v3.pass, 커버리지: v3.cov, 플레이: v3.n },
  검증4_난이도: {
    ok: diffOk, 실행: rand.runs, 평균실패: (rand.failSum / rand.runs).toFixed(2),
    perfect: (pR * 100).toFixed(1) + '%', scarred: (sR * 100).toFixed(1) + '%', extinct: (eR * 100).toFixed(1) + '%',
    아키타입분포: rand.ar,
  },
  검증5_구원무효성: { ok: rescueAllNegative && !rescueRefundPossible, 전부손실포함: rescueAllNegative, 순손실가능: rescueRefundPossible ? '⚠️있음' : '없음' },
  검증6_결정론: detOk ? '✅ 동일시드 동일결과' : '❌ 불일치',
  검증7_방산커버리지: radOk ? `✅ 대멸종 ${massEpochs.length}개 × 변종3` : '❌ 누락',
  검증8_트레이드오프: tradeBad.length === 0 ? '✅ 전 선택지 2↑1↓+' : `❌ ${tradeBad.join(',')}`,
  검증9_엔딩데이터: endingMissing.length === 0 ? '✅ 12종完备' : `❌ 누락 ${endingMissing.join(',')}`,
};
console.log(JSON.stringify(out, null, 2));

const allOk = out.검증1_완전멸종증인.ok && out.검증2_전통과증인.ok && out.검증3_엔딩12종.ok &&
  out.검증4_난이도.ok && out.검증5_구원무효성.ok && detOk && radOk &&
  tradeBad.length === 0 && endingMissing.length === 0;
console.log(allOk ? '\n✅ 전 항목 통과' : '\n❌ 실패 항목 있음');
process.exit(allOk ? 0 : 1);