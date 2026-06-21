# 스펙 온도 🌡️

> **내 스펙의 온도는 몇 도일까요?**  
> 직군별 스펙을 입력하면 GPT-4o-mini가 합격자 데이터 기반으로 취업 경쟁력을 분석하고, 맞춤형 자격증 로드맵을 추천하는 **앱인토스(토스) 미니앱**입니다.

<br>

## 📱 스크린샷

| 인트로 | 스펙 입력 | 분석 결과 |
|:---:|:---:|:---:|
| ![인트로](https://files.catbox.moe/xcmw9o.png) | ![입력 폼](https://files.catbox.moe/vl5psd.png) | ![결과](https://files.catbox.moe/56z5k8.png) |

<br>

## 🚀 핵심 기능

- **AI 스펙 분석** — GPT-4o-mini(JSON mode)로 합격 가능성 점수 및 강약점 진단
- **직군별 맞춤 폼** — 개발 / 비즈니스 / 금융 / 기타 직군 분리 입력
- **자격증 로드맵** — 큐넷 공공데이터 API 연동, 시험일정 직접 링크 제공
- **결과 이미지 저장** — html2canvas로 결과 카드 캡처 후 갤러리 저장 / 공유
- **인앱 광고(IAA)** — 앱인토스 GoogleAdMob SDK 연동, 광고·GPT 분석 병렬 실행

<br>

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18, TypeScript, Vite |
| UI 시스템 | TDS Mobile (Toss Design System) |
| AI 분석 | OpenAI GPT-4o-mini (JSON mode) |
| 외부 API | 큐넷 공공데이터 API (HRD Korea) |
| 플랫폼 SDK | 앱인토스 SDK (AppInToss) |
| 서버리스 | Vercel Functions (API 프록시) |
| 수익화 | 앱인토스 인앱 광고 (IAA) |

<br>

## 🏗 프로젝트 구조

```
src/
├── screens/          # 화면 컴포넌트 (Intro / CommonForm / JobForm / Loading / Result)
├── components/       # CircularGauge, SpecBarChart, RoadmapTimeline, ShareCard
├── api/              # openai.ts, qnet.ts, examSchedule.ts
├── hooks/            # useAd (앱인토스 IAA 훅)
├── constants/        # 직군별 폼 정의, 자격증 코드 매핑
├── prompts/          # GPT 시스템 프롬프트
├── utils/            # scoreTier (점수 → 등급 변환)
└── types/            # TypeScript 타입 (spec.ts)
```

**화면 흐름**

```
인트로 → 공통 스펙 입력 → 직군별 입력 → (광고) → 로딩 → 결과
```

<br>

## ⚡ 주요 구현 포인트

### 1. 광고 + GPT 분석 병렬 실행

분석 버튼을 누르는 순간 GPT 호출과 광고 로드를 동시에 시작합니다.  
광고가 닫힐 때 GPT 응답이 이미 완료됐으면 Loading 화면을 건너뛰고 바로 결과를 표시합니다.

```ts
// App.tsx — 병렬 실행
const promise = analyzeSpec(cs, js);          // ① GPT 즉시 시작
analysisPromiseRef.current = promise;

showAd(() => {                                 // ② 광고 종료 후
  if (earlyResult) handleDone(earlyResult);   //   이미 완료 → 결과 바로 표시
  else setScreen('loading');                  //   미완료 → Loading 대기
});
```

### 2. API 키 보안 — Vercel 서버리스 프록시

OpenAI·큐넷 API 키를 클라이언트에 노출하지 않기 위해 Vercel Functions를 프록시로 활용합니다.

```
Browser  →  /api/analyze (Vercel Function)  →  OpenAI API
Browser  →  /api/qnet    (Vercel Function)  →  HRD Korea API
```

### 3. 결과 이미지 저장

html2canvas로 결과 카드를 2× 해상도 PNG로 캡처, 앱인토스 `saveBase64Data` API로 갤러리에 직접 저장합니다. WebView 미지원 환경에서는 Web Share API → `<a download>` 순으로 fallback합니다.

### 4. 큐넷 시험일정 연동

GPT가 추천한 자격증 이름을 `certCodeMap`(자격증명 → 큐넷 종목코드)으로 변환한 뒤 공공데이터 API에서 접수·시험일정을 가져옵니다. API 실패 시 큐넷 직접 링크를 fallback으로 제공합니다.

<br>

## 🔧 로컬 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# VITE_API_PROXY_URL=http://localhost:3000/api/analyze
# OPENAI_API_KEY=sk-...

# 개발 서버 실행
npm run dev
```

> 앱인토스 SDK 기능(광고, 공유 등)은 토스 앱 WebView 환경에서만 동작합니다.  
> 로컬에서는 SDK 호출을 자동으로 skip하고 콘텐츠 기능만 확인할 수 있습니다.

<br>

## 📎 링크

| | |
|---|---|
| 앱인토스 개발자센터 | https://developers-apps-in-toss.toss.im |
| 큐넷 공공데이터 API | https://openapi.hrdkorea.or.kr |
| TDS Mobile 문서 | https://tossmini-docs.toss.im/tds-mobile |
