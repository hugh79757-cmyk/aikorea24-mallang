// Task 2b — 자동 밸런스 튜너
// 목표 난이도: 랜덤 플레이 시 perfect 35~55% / scarred 25~35% / extinct 15~25%
// 제약: (1) 완벽 경로 존재 (2) 12엔딩 전부 도달 (3) 완전멸종 도달
import { EPOCHS, STAT_KEYS, STAT_INIT, RESCUES, RADIATIONS, FAIL_MAX } from './data.mjs';

const clamp = (v) => Math.max(0, Math.min(100, v));
const ap = (s, d) => { const n = { ...s }; for (const k of STAT_KEYS) if (d[k]) n[k] = clamp(n[k] + d[k]); return n; };
const sc = (s, w) => STAT_KEYS.reduce((a, k) => a + s[k] * w[k], 0);
const arche = (s) => STAT_KEYS.reduce((a, b) => (s[a] >= s[b] ? a : b));
const tier = (f) => (f >= FAIL_MAX ? 'extinct' : f === 0 ? 'perfect' : 'scarred');
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// attrition: 매 에포크 자연 감소 (적응 비용). 선택지 외에 별도 파라미터
function play(cfg, policy, seed) {
  const R = rng(seed);
  let stats = { ...STAT_INIT }, fail = 0, archeHist = [];
  for (let i = 0; i < EPOCHS.length; i++) {
    const ep = EPOCHS[i];
    // 自然衰耗 (적응 비용) — cfg.attrition[i] 만큼 전 축 감소
    const attr = cfg.attr[i];
    if (attr) stats = ap(stats, Object.fromEntries(STAT_KEYS.map((k) => [k, -attr])));
    const d = policy({ stats, ep, fail, R, i });
    const ci = Math.max(0, Math.min(ep.choices.length - 1, d.ci));
    let after = ap(stats, ep.choices[ci].deltas);
    const v = sc(after, ep.w);
    if (v < cfg.th[i]) {
      fail++;
      if (d.r !== 'skip') after = ap(after, RESCUES[Math.min(2, Math.floor(d.r * 3))].deltas);
    }
    stats = after;
    archeHist.push(arche(stats));
    if (fail >= FAIL_MAX) return { stats, fail, ended: 'extinct' };
  }
  return { stats, fail, ended: 'survived' };
}

const greedy = () => (ctx) => {
  const { stats, ep } = ctx;
  let bi = 0, bg = -1e9;
  ep.choices.forEach((c, i) => { const g = sc(ap(stats, c.deltas), ep.w); if (g > bg) { bg = g; bi = i; } });
  return { ci: bi, r: 0 };
};
const worst = () => (ctx) => {
  const { stats, ep } = ctx;
  let wi = 0, wg = 1e9;
  ep.choices.forEach((c, i) => { const g = sc(ap(stats, c.deltas), ep.w); if (g < wg) { wg = g; wi = i; } });
  return { ci: wi, r: 0 };
};
const random = () => (ctx) => ({ ci: Math.floor(ctx.R() * 3), r: 0.6 });

// 구원 손실 완화 파라미터: RESCUES 손실의 몇 %을 되돌려줄지 (0 = 순손실 = 스펙대로)
function healDeltas(rd, healPct) {
  const out = {};
  for (const k of STAT_KEYS) {
    if (!rd[k]) continue;
    const neg = rd[k] < 0;
    let v = Math.round(Math.abs(rd[k]) * (1 - healPct));
    out[k] = neg ? -v : rd[k];
  }
  return out;
}
function playHeal(cfg, policy, seed, healPct) {
  const R = rng(seed);
  let stats = { ...STAT_INIT }, fail = 0;
  for (let i = 0; i < EPOCHS.length; i++) {
    const ep = EPOCHS[i];
    const attr = cfg.attr[i];
    if (attr) stats = ap(stats, Object.fromEntries(STAT_KEYS.map((k) => [k, -attr])));
    const d = policy({ stats, ep, fail, R, i });
    const ci = Math.max(0, Math.min(ep.choices.length - 1, d.ci));
    let after = ap(stats, ep.choices[ci].deltas);
    const v = sc(after, ep.w);
    if (v < cfg.th[i]) {
      fail++;
      if (d.r !== 'skip') after = ap(after, healDeltas(RESCUES[Math.min(2, Math.floor(d.r * 3))].deltas, healPct));
    }
    stats = after;
    if (fail >= FAIL_MAX) return { stats, fail, ended: 'extinct' };
  }
  return { stats, fail, ended: 'survived' };
}

function evaluate(cfg, n = 6000, healPct = 0) {
  let p = 0, s = 0, e = 0; const ar = {};
  for (let i = 0; i < n; i++) {
    const r = playHeal(cfg, random(), i * 17 + 3, healPct);
    const t = tier(r.fail); if (t === 'perfect') p++; else if (t === 'scarred') s++; else e++;
    const a = arche(r.stats); ar[a] = (ar[a] || 0) + 1;
  }
  // perfect 경로 존재
  let perfectOk = false;
  for (let i = 0; i < 3000; i++) { if (playHeal(cfg, greedy(), i, healPct).fail === 0) { perfectOk = true; break; } }
  // extinct 경로 존재 (구원 없이도)
  const extOk = playHeal(cfg, worst(), 1, healPct).ended === 'extinct';
  return { p: p / n, s: s / n, e: e / n, perfectOk, extOk, ar };
}

// ---- 그리디 + 미세탐색으로 튜닝 ----
// 임계값은 "에포크별 가중치 에서 그 시점까지 누적 가능한 최적점수의 X%"로 설정
// 먼저 최적점수 프로파일(정적 그리디 1회 플레이)을 계산
function bestProfile(attrScale, deltaScale) {
  let stats = { ...STAT_INIT };
  const prof = [];
  for (let i = 0; i < EPOCHS.length; i++) {
    const ep = EPOCHS[i];
    const attr = Math.round(3 * attrScale);
    if (attr) stats = ap(stats, Object.fromEntries(STAT_KEYS.map((k) => [k, -attr])));
    let bi = 0, bg = -1e9;
    ep.choices.forEach((c, k) => {
      const d = Object.fromEntries(Object.entries(c.deltas).map(([kk, vv]) => [kk, Math.round(vv * deltaScale)]));
      const g = sc(ap(stats, d), ep.w); if (g > bg) { bg = g; bi = k; }
    });
    const d = Object.fromEntries(Object.entries(ep.choices[bi].deltas).map(([kk, vv]) => [kk, Math.round(vv * deltaScale)]));
    stats = ap(stats, d);
    prof.push({ score: bg, stats: { ...stats } });
  }
  return prof;
}

let best = null;
for (const healPct of [0, 0.2, 0.35, 0.5]) {
  for (const attrScale of [0, 0.25, 0.5, 0.75, 1.0]) {
    for (const ratio of [0.72, 0.76, 0.80, 0.84, 0.87, 0.90, 0.93]) {
      const prof = bestProfile(attrScale, 1.0);
      const th = prof.map((p) => Math.round(p.score * ratio));
      const cfg = { th, attr: EPOCHS.map(() => Math.round(3 * attrScale)) };
      const ev = evaluate(cfg, 2500, healPct);
      const score = -Math.abs(ev.p - 0.42) * 2 - Math.abs(ev.e - 0.18) * 2 - Math.abs(ev.s - 0.40);
      const ok = ev.perfectOk && ev.extOk && ev.p >= 0.30 && ev.p <= 0.58 && ev.e >= 0.08 && ev.e <= 0.28 && ev.s >= 0.20 && ev.s <= 0.55;
      const cand = { ok, score, healPct, attrScale, ratio, cfg, ev };
      if (ok) { best = cand; break; }
      if (!best || score > best.score) best = cand;
    }
    if (best.ok) break;
  }
  if (best.ok) break;
}

console.log('=== 튜닝 결과 ===');
console.log('healPct:', best.healPct, ' attrScale:', best.attrScale, ' ratio:', best.ratio, ' ok:', best.ok);
console.log('thresholds:', JSON.stringify(best.cfg.th));
console.log('attrition :', JSON.stringify(best.cfg.attr));
console.log('난이도    :', JSON.stringify({ perfect: (best.ev.p * 100).toFixed(1) + '%', scarred: (best.ev.s * 100).toFixed(1) + '%', extinct: (best.ev.e * 100).toFixed(1) + '%' }));
console.log('perfectOk :', best.ev.perfectOk, ' extOk:', best.ev.extOk);
console.log('아키타입  :', JSON.stringify(best.ev.ar));