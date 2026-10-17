// Task 1 — 데이터 레이어 (밸런스 튜닝용 독립 파일)
// 이 파일의 DATA 객체는 최종 index.html에 인라인 삽입됨
// 밸런스 검증 하네스(scripts/verify.mjs)가 이 파일을 import해 사용

export const STAT_KEYS = ['might', 'agile', 'vital', 'wise'];
export const STAT_LABELS = { might: '강인', agile: '민첩', vital: '활력', wise: '지혜' };
export const STAT_INIT = { might: 55, agile: 48, vital: 52, wise: 10 };

// 구원 선택 — 절대 손실 (상속)
export const RESCUES = [
  { id: 'r-might', name: '굳은 껍질로 버틴다', desc: '강인 18을 영구히 잃습니다. 단단함은 남습니다.', deltas: { might: -18 } },
  { id: 'r-vital', name: '번식을 줄여 산다', desc: '활력 16을 영구히 잃습니다. 개체 수는 느리게 회복됩니다.', deltas: { vital: -16 } },
  { id: 'r-wise', name: '배움을 태운다', desc: '지혜 14를 영구히 잃습니다. 대신 몸이 가벼워져 다음 위기를 버티기 쉬워집니다.', deltas: { wise: -14, agile: 4 } },
];

// 14개 에포크 — 일반 9 + 대멸종 5
// w: 가중치 (합 1) / threshold: 생존 임계값 (0~100 스케일)
// 각 선택지: title/desc/deltas/nameFragment(종명 조각)
export const EPOCHS = [
  {
    id: 1, age: '38억 년 전', mark: 'ORIGIN · 3.8 BYA', mass: false,
    title: '막이 생기자, 안과 밖이 갈렸다',
    text: '뜨거운 바다의 유기 분자 사이에서 우연히 자신을 복제하는 막 하나가 생겼습니다. 아직 눈도, 입도, 이름도 없습니다.',
    crisis: '열수구의 급격한 온도 변화',
    detail: '영양분은 풍부하지만 수온과 산도가 수시로 뒤집힙니다.',
    w: { might: 0.30, agile: 0.32, vital: 0.24, wise: 0.14 }, threshold: 37,
    choices: [
      { title: '두꺼운 막', desc: '외부 충격을 견디는 대신 물질 교환이 느려집니다.', deltas: { might: 16, agile: -4, vital: -6, wise: 2 }, frag: '갑', flavors: ['단단한 바깥이 곧 살아남음입니다.', '흘러내림보다 붙어 있음입니다.'] },
      { title: '느슨한 막', desc: '환경 변화를 빠르게 받아들이지만 손상에 취약합니다.', deltas: { might: -10, agile: 15, vital: 6, wise: 3 }, frag: '물', flavors: ['변화에 빠른 것은 살아남는 길입니다.', '흐름에 몸을 맡깁니다.'] },
      { title: '선택적 통로', desc: '필요한 분자만 통과시키는 복잡한 막을 만듭니다.', deltas: { might: -2, agile: 5, vital: -5, wise: 15 }, frag: '문', flavors: ['들여오고 내보내는 것을 구분합니다.', '문밖은 매혹이 많습니다.'] },
    ],
  },
  {
    id: 2, age: '24억 년 전', mark: 'OXYGEN · 2.4 BYA', mass: true, massName: '대산소 사건',
    title: '산소는 독이었고, 동시에 연료였습니다',
    text: '광합성 생물이 바다를 산소로 채웠습니다. 기존 생명 대부분에게 산소는 세포를 파괴하는 맹독입니다.',
    crisis: '대산소 사건 — 대산화 오염',
    detail: '산소를 피하거나, 막아내거나, 에너지로 바꿔야 합니다. 이 선택이 이후 20억 년의 지배를 결정합니다.',
    w: { might: 0.22, agile: 0.30, vital: 0.30, wise: 0.18 }, threshold: 37,
    choices: [
      { title: '산소 차단층', desc: '독성을 버티지만 에너지 획득량은 크게 늘지 않습니다.', deltas: { might: 14, agile: -3, vital: -6, wise: 4 }, frag: '막' },
      { title: '산소 호흡', desc: '위험한 산소를 막대한 에너지로 바꿉니다. 이 길은 살아남지만 경쟁자가 폭발합니다.', deltas: { might: -11, agile: 4, vital: 24, wise: 10 }, frag: '불' },
      { title: '무산소 심해로 이동', desc: '경쟁은 줄지만 환경 변화에 고립됩니다.', deltas: { might: 6, agile: -12, vital: 8, wise: -3 }, frag: '깊' },
    ],
  },
  {
    id: 3, age: '21억 년 전', mark: 'SYMBIOSIS · 2.1 BYA', mass: false,
    title: '다른 생물을 삼키고 사는 법',
    text: '어떤 세포가 다른 세포를 삼키고 소화하지 않았습니다. 작은 쪽은 안전하고 큰 쪽은 에너지를 얻습니다. 이 공생이 진핵세포의 기원입니다.',
    crisis: '공생의 딜레마 — 삼킨 자와 삼켜진 자의 신뢰',
    detail: '집에서 나가고 싶어하는 쪽이 한 마리씩 늘어납니다. 어느 쪽이 지배할지 정해야 합니다.',
    w: { might: 0.22, agile: 0.24, vital: 0.30, wise: 0.24 }, threshold: 40,
    choices: [
      { title: '완전한 공생', desc: '서로의 약점을 보완합니다. 대신 몸이 비대해져 민첩함을 잃습니다.', deltas: { might: 8, agile: -8, vital: 18, wise: 12 }, frag: '공' },
      { title: '제어 유지', desc: '큰 쪽이 명령권을 쥡니다. 효율적이지만 작은 쪽의 반발을 샙니다.', deltas: { might: 16, agile: 8, vital: 4, wise: -8 }, frag: '주' },
      { title: '분리 독립', desc: '공생의 위험을 버리고 혼자 살아갑니다. 둘 다 더 약해집니다.', deltas: { might: 8, agile: 12, vital: -12, wise: 4 }, frag: '독' },
    ],
  },
  {
    id: 4, age: '12억 년 전', mark: 'MULTICELL · 1.2 BYA', mass: false,
    title: '하나가 다자가 되었다',
    text: '세포들이 붙고, 각자 일을 나누고, 몸 전체가 하나처럼 움직이려 합니다. 이때 처음으로 몸의 설계도가 생깁니다.',
    crisis: '다자 세포의 첫 분화 — 서로 다른 일을 하는 법',
    detail: '분화는 효율을 부르지만, 몸이 굳으면 환경 변화에 몸을 맞출 수 없습니다.',
    w: { might: 0.24, agile: 0.26, vital: 0.24, wise: 0.26 }, threshold: 41,
    choices: [
      { title: '강한 결합', desc: '세포들이 단단히 묶여 몸이 안정적입니다. 대신 굳은 몸은 유연하지 못합니다.', deltas: { might: 18, agile: -8, vital: 8, wise: 6 }, frag: '속' },
      { title: '느슨한 결합', desc: '언제든 떨어져 나갈 수 있는 느슨한 연결. 변화에 기민하지만 분산을 못 막습니다.', deltas: { might: -10, agile: 16, vital: 4, wise: 8 }, frag: '풀' },
      { title: '분업 정교화', desc: '각 세포가 자기 자리만 알도록 만듭니다. 지혜가 자랍니다.', deltas: { might: 4, agile: 6, vital: -8, wise: 20 }, frag: '칸' },
    ],
  },
  {
    id: 5, age: '7.2억 년 전', mark: 'SNOWBALL · 720 MYA', mass: true, massName: '눈덩이 지구',
    title: '바다가 얼음 아래로 사라졌다',
    text: '행성 대부분이 얼음으로 덮였습니다. 빛은 희미하고 먹이는 드물며, 계절은 수백만 년처럼 깁니다.',
    crisis: '눈덩이 지구 — 전 지구의 평균 기온 급락',
    detail: '오래 버티는 효율과 변화에 대응하는 힘이 동시에 시험받습니다. 둘 다 없으면 멸종합니다.',
    w: { might: 0.30, agile: 0.28, vital: 0.26, wise: 0.16 }, threshold: 47,
    choices: [
      { title: '휴면 포자', desc: '활동을 멈추고 수천 년을 버티지만 진화 속도가 느려집니다.', deltas: { might: 18, agile: -8, vital: 10, wise: -5 }, frag: '잠' },
      { title: '공생 군체', desc: '서로 다른 세포가 자원을 나눠 써 효율이 배가됩니다. 다만 군집이 크면 배신에 취약합니다.', deltas: { might: -6, agile: 10, vital: 12, wise: 14 }, frag: '군' },
      { title: '빙하 틈새 이동', desc: '얼지 않은 틈을 계속 찾아다니며 에너지를 소모합니다.', deltas: { might: -7, agile: 19, vital: -9, wise: 6 }, frag: '이' },
    ],
  },
  {
    id: 6, age: '5.41억 년 전', mark: 'CAMBRIAN · 541 MYA', mass: false,
    title: '세상이 갑자기 눈과 이빨을 갖기 시작했습니다',
    text: '포식과 도피의 군비 경쟁이 폭발합니다. 가만히 있던 생명에게 다른 생명은 처음으로 환경이자 적이 됩니다.',
    crisis: '캄브리아 대폭발 — 먹고, 보거나, 숨지 못하면 상대가 당신의 에너지입니다',
    detail: '이 진화는 가장 자주 오판받는 시기입니다. 실제로는 동시 다발이었고, 그 복잡한 무기가 오히려 얼마나 많은 종을 죽일지가 갈립니다.',
    w: { might: 0.20, agile: 0.30, vital: 0.20, wise: 0.30 }, threshold: 49,
    choices: [
      { title: '외골격', desc: '단단한 방어를 얻지만 성장할 때마다 취약해집니다.', deltas: { might: 19, agile: -7, vital: -7, wise: 8 }, frag: '갑' },
      { title: '감각 기관', desc: '위험을 먼저 감지하지만 신경계를 유지할 비용이 큽니다.', deltas: { might: -4, agile: 13, vital: -10, wise: 19 }, frag: '안' },
      { title: '매복 포식', desc: '적을 먹이로 바꾸지만 먹잇감 감소에 민감해집니다.', deltas: { might: -6, agile: 5, vital: 17, wise: 10 }, frag: '턱' },
    ],
  },
  {
    id: 7, age: '3.75억 년 전', mark: 'LAND · 375 MYA', mass: false,
    title: '물이 줄자, 땅이 선택지가 되었습니다',
    text: '얕은 늪이 마르고 바다의 산소가 줄어듭니다. 축축한 육지는 위험하지만 비어 있는 생태적 공간입니다.',
    crisis: '데본기 후기의 저산소화 — 마른 땅으로의 도약',
    detail: '중력을 이기려면 물기를 잃어야 합니다. 육지 정착은 대개 첫 번째 시도에서 실패했습니다.',
    w: { might: 0.28, agile: 0.36, vital: 0.18, wise: 0.18 }, threshold: 52,
    choices: [
      { title: '원시 폐', desc: '공기에서 산소를 얻어 산소 쟁탈전에서 자유로워집니다. 다만 수중 호흡 효율이 떨어집니다.', deltas: { might: -3, agile: 14, vital: 10, wise: 12 }, frag: '숨' },
      { title: '튼튼한 지느러미', desc: '얕은 물과 진흙을 건너지만 빠른 유영을 잃습니다.', deltas: { might: 10, agile: 9, vital: -8, wise: 8 }, frag: '지' },
      { title: '심해 정착', desc: '변화를 피하고 안정성을 택하지만 영역이 좁아집니다.', deltas: { might: 12, agile: -13, vital: 6, wise: -2 }, frag: '해' },
    ],
  },
  {
    id: 8, age: '2.52억 년 전', mark: 'THE DYING · 252 MYA', mass: true, massName: '페름기 대멸종',
    title: '숲이 무너지고 바다가 숨을 멈췄습니다',
    text: '화산 활동이 기온을 끌어올리고 바다는 산성화됩니다. 지구 생명의 가장 큰 소거가 시작됩니다.',
    crisis: '페름기 말기 소거 — 바다의 산성화',
    detail: '단 하나의 능력보다 균형 잡힌 생존 전략이 필요한 시기입니다. 이 위기를 넘기면 지구의 바다는 돌다가 됩니다.',
    w: { might: 0.32, agile: 0.30, vital: 0.24, wise: 0.14 }, threshold: 53,
    choices: [
      { title: '소형화', desc: '적은 먹이로 버티지만 경쟁과 포식에 약해집니다.', deltas: { might: -8, agile: 10, vital: 20, wise: -8 }, frag: '소' },
      { title: '잡식성', desc: '무엇이든 먹지만 어떤 먹이에도 최고 효율은 아닙니다.', deltas: { might: 4, agile: 18, vital: -5, wise: 2 }, frag: '잡' },
      { title: '굴 생활', desc: '열과 독성 대기를 피하지만 이동과 시야를 잃습니다.', deltas: { might: 17, agile: -8, vital: 6, wise: -4 }, frag: '굴' },
    ],
  },
  {
    id: 9, age: '2.01억 년 전', mark: 'PANGAEA · 201 MYA', mass: false,
    title: '지구를 하나의 덩어리로 꿰맨 날',
    text: '판게아가 완성되고, 내륙의 대부분이 한 덩어리로 합쳐집니다. 바다가 얕아지고 습지가 사라집니다.',
    crisis: '판게아 완성 — 삼각대륙의 마름',
    detail: '육지의 연결은 종을 이동시키기도 하지만, 내륙의 한가운데는 마르고 타 버려 서식지를 잃기도 합니다.',
    w: { might: 0.28, agile: 0.32, vital: 0.22, wise: 0.18 }, threshold: 57,
    choices: [
      { title: '안쪽으로', desc: '내륙으로 들어가 안정적으로 버티지만 경쟁이 치열합니다.', deltas: { might: 14, agile: 4, vital: -4, wise: 8 }, frag: '안' },
      { title: '가장자리로', desc: '경계의 생태계에 몸을 둡니다. 변화가 많지만 적어도 한 곳은 항상 남습니다.', deltas: { might: -6, agile: 18, vital: 6, wise: 6 }, frag: '경' },
      { title: '해안 습지', desc: '안과 바다의 경계에서 가장 많은 에너지를 얻습니다. 다만 삼각대륙의 마름에 취약합니다.', deltas: { might: 6, agile: 8, vital: 18, wise: -6 }, frag: '연' },
    ],
  },
  {
    id: 10, age: '6600만 년 전', mark: 'IMPACT · 66 MYA', mass: true, massName: '백악기–팔레오기 충돌',
    title: '하늘이 불타고, 긴 밤이 내려왔다',
    text: '충돌 뒤 먼지가 햇빛을 가립니다. 거대한 몸과 정교한 생태 관계가 한순간에 부채가 됩니다.',
    crisis: 'K-Pg 충돌 — 먹이망 단절',
    detail: '먹이를 비축해 충격을 수년을 견딜 전략이 필요합니다. 이 한 번이 이후 지구의 지배종을 결정합니다.',
    w: { might: 0.30, agile: 0.26, vital: 0.28, wise: 0.16 }, threshold: 57,
    choices: [
      { title: '야행성', desc: '어둠을 활동 시간으로 삼지만 시각과 체온 유지 비용이 늘어납니다.', deltas: { might: 2, agile: 14, vital: -8, wise: 9 }, frag: '야' },
      { title: '씨앗 저장', desc: '먹이를 비축해 충격을 버티지만 서식지 이동이 느려집니다.', deltas: { might: 13, agile: -6, vital: 10, wise: 1 }, frag: '저' },
      { title: '빠른 번식', desc: '손실을 수로 메우지만 개체당 생존력은 낮아집니다.', deltas: { might: -12, agile: 9, vital: 18, wise: -5 }, frag: '다' },
    ],
  },
  {
    id: 11, age: '3000만 년 전', mark: 'MAMMAL · 30 MYA', mass: false,
    title: '작은 것들의 밤이 지나갔다',
    text: '거대한 먹이망이 무너진 빈자리에, 작고 수많은 것들이 밤을 피해 번성하기 시작합니다.',
    crisis: '빈 자리의 시대 — 종 분화 폭발',
    detail: '큰 몸을 잃은 대신,무리와 학습이 새로운 무기로 올라섭니다.',
    w: { might: 0.22, agile: 0.26, vital: 0.24, wise: 0.28 }, threshold: 62,
    choices: [
      { title: '무리 생활', desc: '함께 행동하며 서로의 몸을 아끼는 법을 배웁니다. 대신 무리의 다툼이 배를 채웁니다.', deltas: { might: -6, agile: 10, vital: 4, wise: 18 }, frag: '무리' },
      { title: '야행성 지배', desc: '밤을 장악하며 낮의 냉각 비용을 아낍니다. 대신 낮의 시력을 잃고 몸이 작아집니다.', deltas: { might: -4, agile: 12, vital: 6, wise: 6 }, frag: '밤' },
      { title: '개별 방어', desc: '각자 살아남는 길을 찾습니다. 분산은되지만 함께가 아닙니다.', deltas: { might: 12, agile: -8, vital: 8, wise: 4 }, frag: '개' },
    ],
  },
  {
    id: 12, age: '700만 년 전', mark: 'MIOCENE · 7 MYA', mass: false,
    title: '서서히 울퉁불퉁해진 지면',
    text: '판이 움직이며 산과 평야가 교대합니다. 평야가 늘고, 그 위에서 두 발로 선 자리가 생깁니다.',
    crisis: '초원 팽창 — 두 발로 서고 싶은 유혹',
    detail: '손을 자유롭게 쓸 수 있지만, 그만큼 방어와 순발력을 잃습니다.',
    w: { might: 0.20, agile: 0.28, vital: 0.20, wise: 0.32 }, threshold: 63,
    choices: [
      { title: '손을 자유롭게', desc: '두 손으로 새로운 에너지원을 만듭니다. 대신 발로 달리는 능력은 약해집니다.', deltas: { might: -8, agile: 10, vital: 6, wise: 20 }, frag: '손' },
      { title: '완전 직립', desc: '두 발로 완전히 서서 하늘을 봅니다. 대신 달리는 속도를 잃습니다.', deltas: { might: 6, agile: -12, vital: 10, wise: 14 }, frag: '립' },
      { title: '사족 유지', desc: '네 발을 유지해 효율적으로 달립니다. 대신 진화 가능성은 좁아집니다.', deltas: { might: 12, agile: 12, vital: 14, wise: -12 }, frag: '족' },
    ],
  },
  {
    id: 13, age: '260만 년 전', mark: 'ICE AGE · 2.6 MYA', mass: false,
    title: '기후가 흔들릴 때마다 길이 달라졌습니다',
    text: '빙하가 전진하고 후퇴합니다. 이제 환경은 빠르게 바뀌며, 혼자 아는 것보다 함께 기억하는 것이 강해집니다.',
    crisis: '반복되는 빙기와 간빙기',
    detail: '마지막 분기는 몸의 진화만이 아니라 행동과 관계의 진화입니다.',
    w: { might: 0.22, agile: 0.32, vital: 0.16, wise: 0.30 }, threshold: 66,
    choices: [
      { title: '사회적 학습', desc: '경험을 무리와 공유합니다. 대신 몸이 작아지고 적응이 늦어집니다.', deltas: { might: -4, agile: 10, vital: 2, wise: 18 }, frag: '공유' },
      { title: '장거리 이동', desc: '기후대를 따라 이동하며, 이동 자체가 이 계통의 생존 방식이 됩니다.', deltas: { might: -4, agile: 14, vital: 12, wise: 5 }, frag: '이주' },
      { title: '두꺼운 보온층', desc: '추위를 견디며 에너지 소모를 줄입니다. 대신 온난기에는 과열됩니다.', deltas: { might: 18, agile: -12, vital: 8, wise: 2 }, frag: '한' },
    ],
  },
  {
    id: 14, age: '지금', mark: 'NOW · TODAY', mass: true, massName: '인류 시대의 대멸종',
    title: '여기로서, 마지막 질문',
    text: '당신의 계통은 38억 년을 살아왔습니다. 지금, 환경은 다시 빠르게 변하고 있습니다. 이번엔 당신이 환경입니다.',
    crisis: '지배자의 시대 — 마지막 갈림길',
    detail: '이 선택이 38억 년의 계통을 어디까지 끌고 갈지 결정합니다. 어차피 멸종해도 분기하겠지만, 후계자가 누구인가는 중요합니다.',
    w: { might: 0.22, agile: 0.22, vital: 0.30, wise: 0.26 }, threshold: 66,
    choices: [
      { title: '지혜 극대화', desc: '배움을 극대화합니다. 개체수는 줄어도 지배 계통이 될 가능성.', deltas: { might: -6, agile: 4, vital: -8, wise: 26 }, frag: '지' },
      { title: '균형 유지', desc: '네 축을 고르게 지킵니다. 특별히 뛰지 않지만 어디에도 뒤처지지 않습니다. 대신 어떤 축도 극단으로 치닿지 못합니다.', deltas: { might: 6, agile: -4, vital: 6, wise: 6 }, frag: '균' },
      { title: '생존 극대화', desc: '단순히 오래 사는 것에 집중합니다. 아름다움은 남지 않을 수 있습니다.', deltas: { might: 14, agile: 8, vital: 14, wise: -16 }, frag: '존' },
    ],
  },
];

// 방산 — 대멸종 에포크마다 변종 3개 (선택지 3개와 1:1 대응하는 후계자)
// parallelFuture: "만약 이걸 골랐다면" 평행세계 문장
export const RADIATIONS = {
  2: [
    { name: '차폐 방어형', desc: '불활성화 층을 두껍게 감고 산소를 피합니다.', deltas: { might: 14, vital: -6 }, parts: ['shield'], future: '산소를 외면한 그 계통은 20억 년간 바다가 아니라 진공에 가깝게 남았을 것입니다. 지금도 산소 앞에서만 살고 있습니다.' },
    { name: '호흡 기관형', desc: '산소를 에너지로 전환하는 거대한 기관을 발달시켰습니다.', deltas: { vital: 24, wise: 10 }, parts: ['flame'], future: '그 계통은 산소를 에너지로 삼아 마침내 가장 큰 몸을 가졌습니다. 다만 너무 커져서 작은 웅덩이에서 갇혔을지도 모릅니다.' },
    { name: '심해 은둔형', desc: '산소가 없는 심해로 물러나 경쟁을 피했습니다.', deltas: { might: 6, vital: 8, agile: -12 }, parts: ['deep'], future: '은둔한 그 계통은 산소 지옥에서 살아남아 오늘도 무산소 수심 4km에서 혼자 계보서를 씁니다. 위로는 올라가지 않았습니다.' },
  ],
  5: [
    { name: '휴면 장기형', desc: '수천 년을 잠자는 포자를 계약으로 무장했습니다.', deltas: { might: 18, vital: 10, wise: -5 }, parts: ['cloak'], future: '얼음이 녹을 때마다 몇 개체만이 깨어나 무언가를 남겼을 것입니다. 느리지만 한 번도 끊기진 않았습니다.' },
    { name: '공생 군체형', desc: '여러 종류가 함께 사는 연합 군체를 만들었습니다.', deltas: { agile: 10, wise: 16 }, parts: ['cluster'], future: '군체형 그 계통은 배신 없는 사회를 유지했는지, 아니면 끝내 제국을 세웠는지 알 수 없습니다. 스무 개체가 하나가 되었습니다.' },
    { name: '빙하 유영형', desc: '얼지 않은 틈을 헤치며 살아남았습니다.', deltas: { agile: 19, vital: -9 }, parts: ['fin'], future: '항상 움직인 그 계통은 눈덩이가 걷힌 뒤 자리를 옮기지 못했을 것입니다. 처음 열린 바다에서 멸종했습니다.' },
  ],
  8: [
    { name: '왜소 생존형', desc: '몸을 줄여 작은 틈새와 적은 먹이로 버텼습니다.', deltas: { vital: 20, agile: 10, might: -8 }, parts: ['small'], future: '작아진 그 계통은 대멸종을 온몸으로 버티고, 위대한 회복기에 값을 치를 것입니다. 작음이 진짜 무기였습니다.' },
    { name: '잡식 방랑형', desc: '무엇이든 먹고 어디든 가는 생존 전략을 택했습니다.', deltas: { agile: 18, wise: 2, vital: -5 }, parts: ['roam'], future: '잡식성 그 계통은 한 영역에 남지 않고 지구를 두루았습니다. 진화는 느렸지만 멸종은 피했습니다.' },
    { name: '지하 잠복형', desc: '땅 아래 그물과 동굴로 몸을 숨겼습니다.', deltas: { might: 17, agile: -8 }, parts: ['burrow'], future: '땅속에 숨은 그 계통은 지상의 모든 멸종을 보지 못했습니다. 그리고 지상 생명을 단 한 번도 몰랐습니다.' },
  ],
  10: [
    { name: '밤의 지배자', desc: '충돌 이후 어둠을 지배하며 살아남았습니다.', deltas: { agile: 14, wise: 9, vital: -8 }, parts: ['nocturne'], future: '밤길 그 계통은 공포의 왕이 되었습니다. 인류가 무서워했던 것은 사실 우리가 그 계통의 후손이었다는 뜻입니다.' },
    { name: '저장채식자', desc: '먹이를 비축하고 시간을 건너뛰었습니다.', deltas: { might: 13, vital: 10 }, parts: ['cache'], future: '비축형 그 계통은 긴 겨울을 다리처럼 넘었습니다. 화석이 아니라 살아있는 기록을 남겼습니다.' },
    { name: '급속 번식자', desc: '수만 개체를 순식간에 만들어냈습니다.', deltas: { vital: 18, agile: 9, might: -12 }, parts: ['swarm'], future: '다산형 그 계통은 개체당으로는 약했지만, 수가 많아 멸종을 밀어냈습니다. 진짜 단위는 개체가 아니었습니다.' },
  ],
  14: [
    { name: '지혜 계통', desc: '배움을 최대화한, 지금의 지배자.', deltas: { wise: 26, might: -6, vital: -8 }, parts: ['crown'], future: '만약 그때 지혜를 택했다면, 인류가 아니라 그 계통이 지금 이 자리에 서 있을 것입니다. 지구에는 사실 두 개의 지배자가 있었습니다.' },
    { name: '균형 계통', desc: '네 축을 고르게 유지한, 안정된 후계자.', deltas: { might: 6, agile: 6, vital: 6, wise: 6 }, parts: ['ring'], future: '균형형 그 계통은 화려하지 않았습니다. 대신 멸종하지도, 지배하지도 않았습니다. 조용히 38억 년을 지켜보는 존재였습니다.' },
    { name: '장수 생존 계통', desc: '오래 사는 것에 집중한, 조용한 계통.', deltas: { might: 14, agile: 8, vital: 14, wise: -16 }, parts: ['stone'], future: '생존 극대화형 그 계통은 아름답지 않았습니다. 그러나 이것만은 분명합니다 — 다음 멸종이 오면, 살아남는 건 이 계통입니다.' },
  ],
};

// 엔딩 — 3티어 × 4아키타입 = 12종
// title: 큰 제목 / summary: 요약 / saga: 한 줄 서사 (클립보드)
export const ENDINGS = {
  perfect: {
    might: { title: '속이 단단한 말랑', summary: '38억 년간 단 한 번도 떨지 않았습니다. 당신의 계통은 몸이 단단한 쪽으로 끝까지 가졌습니다. 이게 복종이 아닙니다 — 선택이 복종이었고, 당신은 매번 그걸 골랐습니다.', saga: '나는 막으로 시작해 강인만 골랐다. 그래서 38억 년 뒤에도 여기 서 있다.' },
    agile: { title: '달리는 말랑', summary: '바다는 당신을 쫓아왔고, 당신은 바다가 멈추기 전에 달렸습니다. 멸종을 다섯 번 만나고, 다섯 번 다른 모습으로 달려 나왔습니다.', saga: '나는 물러서지 않았다. 물러설 때마다 멸종했다. 38억 년 뒤 여기 도착했다.' },
    vital: { title: '곁에 남는 말랑', summary: '당신은 늘 곁에 있는 쪽을 골랐습니다. 크지 않아도, 화려하지 않아도, 가장 오래 지속된 쪽을. 그게 이 계통의 무기였습니다.', saga: '나는 늘 곁에 남는 쪽을 골랐다. 그게 전부였고, 그게 전부였다.' },
    wise: { title: '생각하는 말랑', summary: '38억 년의 끝에서, 당신의 계통은 처음으로 자신을 알게 됐습니다. 그 지혜가 멸종을 피해선 다음 세대로 갚아줄까요.', saga: '나는 배운 쪽을 골랐다. 그래서 38억 년 후, 처음으로 이 계통이 자기 손으로 다음을 고를 수 있게 되었다.' },
  },
  scarred: {
    might: { title: '깎여 나간 단단함', summary: '당신의 계통은 멸종을 거쳤습니다. 다만 굴러가며 살아남는 쪽이었습니다. 상처가 이 계통의 유일한 몸틀입니다.', saga: '나는 굴러서 멸종을 넘겼다. 상처가 이 계통의 무기다.' },
    agile: { title: '도망의 귀환자', summary: '다섯 번의 대멸종을 모두 달아났습니다. 당신의 계통은 지쳐 있지만, 멸종을 피하는 것 자체가 이 계통의 재능입니다.', saga: '나는 다섯 번 도망쳤다. 그리고 전부 돌아와 후계자를 남겼다.' },
    vital: { title: '곁에 남은 것들', summary: '거대한 것은 모두 죽고, 당신의 계통만 작게 남았습니다. 작게 남는 데에는 이유가 있습니다.', saga: '나는 곁에 남는 쪽을 골랐다. 그게 멸종을 피하는 유일한 이유였다.' },
    wise: { title: '배움의 잔해', summary: '멸종을 지났지만 지혜는 남겼습니다. 후배들이 그것을 다시 배웠습니다. 기억이 재생될 때마다 계통은 조금 더 똑똑해집니다.', saga: '나는 배웠고, 죽었고, 배운 걸 남겼다. 이게 계통이 지혜를 건네는 방식이다.' },
  },
  extinct: {
    might: { title: '단단했으나 멸종한 말랑', summary: '당신의 계통은 38억 년을 버텼습니다. 그리고 멸종했습니다. 강함만으로는 오래 못 갑니다 — 이 계통의 유일한 교훈입니다.', saga: '나는 강했었다. 그래서 멸종했다. 강한 것과 오래가는 것은 다르다.' },
    agile: { title: '달렸으나 멸종한 말랑', summary: '도망은 천재였지만 세상은 더 빠르게 변했습니다. 당신의 계통은 끝내 따라잡지 못했습니다. 달리는 것만으로는 살아남지 않습니다.', saga: '나는 달렸었다. 세상은 더 빨랐다. 아무것도 못 붙었다.' },
    vital: { title: '곁에 남았으나 멸종한 말랑', summary: '곁에 남는 전략이 가장 안전하다고 했죠. 그러나 이 계통은 결국 끝까지 곁에 남지 못했습니다.', saga: '나는 곁에 남으려 했다. 그런데 곁에 남을 자리가 없었다.' },
    wise: { title: '생각했지만 멸종한 말랑', summary: '지혜로 이 세상을 이해했는데, 이해한다고 살아남지는 않습니다. 당신의 계통은 너무 많이 알기만 했습니다.', saga: '나는 이해했다. 그런데 이해한다고 살아남진 않는다.' },
  },
};

export const FAIL_MAX = 3;
// 적응 비용: 매 에포크 전 축 자연 감소 (scripts/tune.mjs 로 확정)
export const ATTRITION = 2;
// 구원 유예: 구원 후 다음 N개 에포크 임계값 면제 (생존은 이어짐, fail 카운트는 되돌리지 않음)
export const RESCUE_GRACE = 1;
// 구원 손실 완화: 순손실의 50%만 실제 차감 (나머지는 회복)
export const RESCUE_HEAL = 0.5;