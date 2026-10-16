# 구현 계획 — 말랑 (Mallang) 38억 년 진화 일지

**목표**: `public/index.html` 단일 파일 완성 + 이미지/파비콘 자산 + 검증 7항목 통과 + 배포(인증 대기)

**원칙** (이전 caveman 진단 교훈):
1. 모든 선택이 4축 스탯에 즉시 반영 → 결과가 실제로 달라짐
2. 실패 상태 존재 (3회 누적 = 완전 멸종), 단 게임오버 아님
3. 되먹임 항상 화면에 보임 (스탯바 즉시 갱신 + 애니메이션)
4. 클릭 압축 (19회)
5. 엔딩 전부 계산 생성 (하드코딩 금지)
6. 데이터(에포크/선택지/방산)는 JS 객체 리터럴 — 별도 파일 없이 인라인

---

## Task 구조 (의존성 순)

### Task 1 — 데이터 레이어 (data.js 인라인 객체)
- `EPOCHS`: 14개 (일반 9 + 대멸종 5), 각 에포크의 `w`(가중치) / `threshold` / `text` / `crisis` / 선택지 3개
- `RESCUES`: 3가지 (강인−18 / 활력−16 / 지혜−14+민첩+10)
- `RADIATIONS`: 대멸종 5개 × 변종 3개 (name/desc/deltas/parts/parallelFuture)
- `ENDINGS`: 3티어 × 4아키타입 = 12
- **검증**: 각 선택지 최소 2축↑ + 1축↓ (스크립트 assert)

### Task 2 — 밸런스 튜닝 (Node 하네스)
- `scripts/verify.mjs`: 메모이제이션 DP로 3^14 경로 전수 탐색
- 검증 7항목:
  1. 완전 멸종 도달 가능
  2. 전 에포크 무사 통과 가능
  3. 엔딩 12종 전부 출현
  4. 난이도 (랜덤 10,000회 통계)
  5. 구원 무효성 (실패 상쇄 불가)
  6. 결정론 (동일 시드 해시 일치)
  7. 브라우저 스냅샷 (별도)
- **임계값 튜닝**: 검증 1·2·3 통과할 때까지 threshold/w 조정

### Task 3 — 시각 레이어 (파스텔 SVG 블롭)
- CSS 변수 팔레트 6색 + 에포크별 배경 그라데이션
- 절차적 SVG 블롭 렌더러: 스탯 4축 → 외형 파츠 (갑각 스파이크 / 지느러미-leg / 부피 / 눈+촉수)
- idle 애니메이션 (스케일 펄스 + 눈 깜빡임) + 진화 스파클 파티클
- `prefers-reduced-motion` 존중

### Task 4 — UI/레이아웃
- 데스크톱 2열 / 모바일 1열 (스탯 상단 고정)
- 에포크 카드(블롭+사건+위험축배지+선택지 3카드)
- 스탯 4바 (선택 즉시 애니메이션 갱신)
- 실패 → 구원 오버레이 / 대멸종 → 방산 오버레이
- 계통수 미니 트리 (스택 리스트 — 로그 스크롤 버그 회피)
- 평행세계 수첩 (사이드)

### Task 5 — 게임 상태 머신
- `state = {epoch, stats, failCount, choices[], parallel[], radiationLog[], phase, seed}`
- `choose(i)` → 판정 → 분기(구원/방산/엔딩)
- 결정론 코어 + 시드 기반 flavor 셔플 (mulberry32)
- `?seed=` URL 파라미터

### Task 6 — 엔딩 화면
- 결과 카드 (종명·도달 에포크·지배형질·평균지수)
- 한 줄 서사 + 클립보드 복사
- 평행세계 카드 그리드 (5 대멸종 × 2 = 10장)
- 38억 년 선택 기록 타임라인
- 재시작

### Task 7 — 자산 (이미지 · 파비콘)
- 파비콘: 인라인 SVG data-URI (파스텔 블롭 얼굴)
- OG 이미지: 1200×630 파스텔 일러스트 (SVG → 외부파일 or data-URI)
- 히어로 배경 3~4장 (에포크별 파스텔 씬, SVG 인라인 data-URI로 충분)

### Task 8 — 검증 실행
- Node `verify.mjs` 7항목 중 1~6 실행 (7은 Playwright 별도)
- Playwright 스크린샷 (데스크톱+모바일) 육안 검토
- 결정론 확인

### Task 9 — 배포 (인증 대기)
- wrangler.jsonc (caveman 패턴, 커스텀 도메인 `mallang.aikorea24.kr` 후보)
- stylefactory9ai@gmail.com 인증 확보 후 `wrangler deploy`
- DNS AAAA `100::` proxied (CF_DNS_TOKEN)

---

## 파일 구조
```
aikorea24-mallang/
  public/index.html          ← 게임 본체 (단일 파일, 목표 150~250KB)
  wrangler.jsonc             ← 배포 설정
  scripts/verify.mjs         ← 전수 검증 하네스
  scripts/balance.mjs        ← 난이도 튜닝 도구
  scripts/screenshot.mjs     ← Playwright 검증
  reference-분기점-레퍼런스.html
  docs/superpowers/specs/2026-10-16-mallang-evolution-design.md
```

---

## 위험 요소 & 대응

| 위험 | 대응 |
|---|---|
| stylefactory9ai 계정 토큰 없음 | Task 1~8 완전 독립. 인증 확보 즉시 Task 9. |
| 3^14 전수 탐색 메모리 | 메모이제이션 DP — 동일 스탯 상태는 1회만 탐색 (실제 상태수 << 4.8M) |
| 임계값 튜닝 수렴 안 됨 | Task 2를 Task 3보다 먼저 — 밸런스 확정 후 시각 작업 |
| PNG 이미지 파일 없음 | 전부 SVG data-URI 인라인 (외부 자산 0) |
| 단일 파일 250KB 초과 | flavor 문장 최소화, OG 이미지는 data-URI 압축 |