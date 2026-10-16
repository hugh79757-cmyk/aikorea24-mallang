// Task 8 — Playwright 브라우저 검증 (데스크톱 + 모바일)
// 주의: 버튼 클릭은 JS evaluate 로 수행한다 (innerHTML 재생성으로 Playwright click 이 튕림)
const { chromium } = require('/Users/twinssn/Projects/heritage/node_modules/playwright');
const FILE = 'file:///Users/twinssn/Projects/aikorea24-mallang/public/index.html';
const OUT = '/Users/twinssn/Projects/aikorea24-mallang/verify-shots';
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const report = {};

  async function run(label, viewport) {
    const ctx = await browser.newContext({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${label}] console: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ${e.message}`));
    await page.goto(FILE, { waitUntil: 'load' });
    await page.screenshot({ path: `${OUT}/${label}-00-intro.png` });

    await page.click('#startBtn');
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${OUT}/${label}-01-epoch1.png` });

    const s1 = await page.evaluate(() => ({
      blobNodes: document.querySelectorAll('#blob *').length,
      stats: [...document.querySelectorAll('.statrow')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()),
      mainChoices: document.querySelectorAll('.choice[data-i]').length,
      dots: document.querySelectorAll('.dot').length,
      species: document.getElementById('spName').textContent,
      threat: document.getElementById('threatbar').textContent.replace(/\s+/g, ' ').trim().slice(0, 70),
      failBadge: document.getElementById('failBadge').textContent.replace(/\s+/g, ' ').trim(),
    }));

    const deltas = await page.evaluate(() => [...document.querySelectorAll('.choice[data-i]')].map((c) => ({
      ups: c.querySelectorAll('.delta:not(.minus)').length,
      downs: c.querySelectorAll('.delta.minus').length,
    })));

    // 자동 플레이 — JS 클릭으로 (안정성 문제 회피)
    let steps = 0, rescues = 0, radiations = 0, ended = false;
    const failSeen = [];
    for (; steps < 200; steps++) {
      const st = await page.evaluate(() => ({
        ov: document.getElementById('overlay').classList.contains('show'),
        rescue: !!document.getElementById('skipRescue'),
        rad: !!document.querySelector('[data-v]'),
        isEnding: !!document.getElementById('againBtn'),
        main: document.querySelectorAll('.choice[data-i]').length,
        fail: document.getElementById('failBadge').textContent.replace(/\\D+/g, '').trim(),
      }));
      if (st.isEnding) { ended = true; break; }
      if (st.ov) {
        if (st.rescue) { rescues++; await page.evaluate(() => { const e = document.querySelector('[data-r="0"]'); if (e) e.click(); }); await page.waitForTimeout(220); continue; }
        if (st.rad) { radiations++; await page.evaluate(() => { const e = document.querySelector('[data-v="0"]'); if (e) e.click(); }); await page.waitForTimeout(280); continue; }
        await page.waitForTimeout(220); continue;
      }
      if (!st.main) break;
      failSeen.push(st.fail);
      await page.evaluate(() => { const e = document.querySelector('.choice[data-i="0"]'); if (e) e.click(); });
      await page.waitForTimeout(120);
    }

    const endInfo = await page.evaluate(() => ({
      tag: document.querySelector('.endingtag')?.textContent || null,
      title: document.querySelector('.endingtitle')?.textContent || null,
      species: document.querySelector('.gcell b')?.textContent || null,
      logLines: document.querySelectorAll('.logline').length,
      badLines: document.querySelectorAll('.logline.bad').length,
      parallelCards: document.querySelectorAll('.par').length,
      saga: document.querySelector('.saga')?.textContent || null,
      overlayShown: document.getElementById('overlay').classList.contains('show'),
    }));
    await page.screenshot({ path: `${OUT}/${label}-02-ending.png`, fullPage: true });

    // 재시작 검증
    let restartOk = false;
    if (ended) {
      await page.evaluate(() => document.getElementById('againBtn').click());
      await page.waitForTimeout(400);
      restartOk = await page.evaluate(() =>
        document.querySelectorAll('.choice[data-i]').length === 3 &&
        document.getElementById('failBadge').textContent.includes('0') &&
        !document.getElementById('overlay').classList.contains('show'));
      await page.screenshot({ path: `${OUT}/${label}-03-restart.png` });
    }

    await ctx.close();
    return { label, s1, deltas, steps, rescues, radiations, ended, endInfo, restartOk, failProgression: failSeen.join('') };
  }

  report.desktop = await run('desktop', { width: 1440, height: 900 });
  report.mobile = await run('mobile', { width: 390, height: 844 });
  report.errors = errors;

  const ok = report.desktop.ended && report.mobile.ended &&
    report.desktop.restartOk && report.mobile.restartOk &&
    report.desktop.s1.blobNodes > 10 && report.desktop.s1.mainChoices === 3 &&
    errors.length === 0;
  console.log(JSON.stringify(report, null, 1));
  console.log(ok ? '\n✅ 브라우저 검증 통과' : '\n❌ 실패');
  await browser.close();
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });