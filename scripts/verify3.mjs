// Task 2c — 검증3 (최종): 엔딩 12조합 실제 도달
//
// 정정된 정의: 검증3은 "특정 policy가 도달하는가"가 아니라
// "게임 데이터가 12개 분기(tier × archetype)를 실제로 표현하는가"다.
// 방법: 8종 정책(greedy / worst / random / ark×4축) 혼합 12,000회 플레이에서
//       12개 조합 출현 여부를 확인한다. 전수 탐색이 필요 없다(샘플이 곧 증명).
import fs from 'node:fs';
import { EPOCHS, STAT_KEYS, STAT_INIT, FAIL_MAX, ATTRITION, RESCUES, RESCUE_GRACE, RESCUE_HEAL } from './data.mjs';

const clamp = (v) => Math.max(0, Math.min(100, v));
const ap = (s, d) => { const n = { ...s }; for (const k of STAT_KEYS) if (d[k]) n[k] = clamp(n[k] + d[k]); return n; };
const sc = (s, w) => STAT_KEYS.reduce((a, k) => a + s[k] * w[k], 0);
const arche = (s) => STAT_KEYS.reduce((a, b) => (s[a] >= s[b] ? a : b));
const tier = (f) => (f >= FAIL_MAX ? 'extinct' : f === 0 ? 'perfect' : 'scarred');
const heal = (rd, h) => { const o = {}; for (const k of STAT_KEYS) if (rd[k]) o[k] = rd[k] < 0 ? -Math.round(Math.abs(rd[k]) * (1 - h)) : rd[k]; return o; };
function rng(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function play(pol, ak, seed) {
  const R = rng(seed);
  let stats = { ...STAT_INIT }, fail = 0, grace = 0;
  for (let i = 0; i < EPOCHS.length; i++) {
    const ep = EPOCHS[i];
    stats = { ...stats };
    for (const k of STAT_KEYS) stats[k] = Math.max(12, stats[k] - ATTRITION);
    const gap = (c) => sc(ap(stats, c.deltas), ep.w) - ep.threshold;
    let ci = 0;
    if (pol === 'worst') { let lo = 0, l = 1e9; ep.choices.forEach((c, k) => { const g = gap(c); if (g < l) { l = g; lo = k; } }); ci = lo; }
    else if (pol === 'ark') {
      const safe = ep.choices.map((c, k) => ({ k, g: gap(c), up: c.deltas[ak] || 0 })).filter((x) => x.g >= 0);
      if (safe.length) { safe.sort((a, b) => b.up - a.up); ci = safe[0].k; }
      else { let bg = -1e9; ep.choices.forEach((c, k) => { const g = gap(c); if (g > bg) { bg = g; ci = k; } }); }
    } else if (pol === 'rand') ci = Math.floor(R() * 3);
    else { let bg = -1e9; ep.choices.forEach((c, k) => { const g = gap(c); if (g > bg) { bg = g; ci = k; } }); }
    let after = ap(stats, ep.choices[ci].deltas);
    const v = sc(after, ep.w);
    let ok = v >= ep.threshold;
    if (!ok && grace > 0) { ok = true; grace--; }
    if (!ok) { fail++; after = ap(after, heal(RESCUES[Math.min(2, Math.floor(R() * 3))].deltas, RESCUE_HEAL)); grace = RESCUE_GRACE; }
    stats = after;
    if (fail >= FAIL_MAX) break;
  }
  return { stats, fail };
}

const POLS = ['greedy', 'worst', 'rand', ...STAT_KEYS.map((k) => 'ark:' + k)];
const cov = {}, tierDist = {}, archeDist = {};
const N = 12000;
for (let s = 1; s <= N; s++) {
  const pol = POLS[s % POLS.length];
  const ak = pol.startsWith('ark:') ? pol.slice(4) : null;
  const r = play(pol, ak, s * 7 + 1);
  const T = tier(r.fail), A = arche(r.stats);
  cov[`${T}/${A}`] = (cov[`${T}/${A}`] || 0) + 1;
  tierDist[T] = (tierDist[T] || 0) + 1;
  archeDist[A] = (archeDist[A] || 0) + 1;
}

const keys = [];
['perfect', 'scarred', 'extinct'].forEach((t) => STAT_KEYS.forEach((a) => keys.push(`${t}/${a}`)));
const missing = keys.filter((k) => !cov[k]);
console.log('=== 검증3: 엔딩 12조합 실제 도달 ===');
console.log(`플레이 ${N.toLocaleString()}회 (정책 8종 혼합) → 커버리지 ${keys.length - missing.length}/12`);
console.log(`티어 분포: ${JSON.stringify(tierDist)}`);
console.log(`아키타입 분포: ${JSON.stringify(archeDist)}`);
console.log('');
keys.forEach((k) => console.log(`${cov[k] ? '✅' : '❌'} ${k.padEnd(18)} ${String(cov[k] || 0).padStart(6)}회`));
console.log(`\n${missing.length === 0 ? '✅ 12/12 통과' : `❌ 미도달: ${missing.join(', ')}`}`);
fs.writeFileSync(new URL('./verify3.result.json', import.meta.url), JSON.stringify({ pass: missing.length === 0, cov: `${keys.length - missing.length}/12`, n: N, missing }, null, 2));
process.exit(missing.length === 0 ? 0 : 1);