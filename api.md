# API 작업 지침

## GPT API

### 모델
- **기본**: `gpt-4o-mini` — 구조화된 분석, 비용 효율
- **fallback**: `gpt-4o` — 복잡한 케이스

### 호출 패턴

```ts
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(userSpec) },
  ],
  response_format: { type: 'json_object' },
  max_tokens: 2000,
});
```

### 에러 핸들링

```ts
try {
  const result = await callGPT(spec);
} catch (error) {
  // timeout, rate limit 모두 처리
  showToast('분석 중 오류가 발생했어요. 다시 시도해주세요.');
}
```

- GPT 응답은 반드시 JSON 파싱 예외 처리
- 동일 스펙 조합 결과 캐싱 고려 (AsyncStorage)

### 면책 문구 필수

분석 결과 화면 하단에 반드시 포함:
> "AI 분석 결과는 참고용이며 실제 채용 기준과 다를 수 있어요."

---

## 큐넷 API

```ts
const QNET_BASE = 'https://openapi.hrdkorea.or.kr/api/v1/examination';

async function getExamSchedule(qualCode: string) {
  const res = await fetch(
    `${QNET_BASE}/schedule?serviceKey=${API_KEY}&qualCode=${qualCode}`
  );
  return res.json();
}

// API 실패 시 fallback
catch {
  return { fallbackUrl: 'https://www.q-net.or.kr/crf021.do' };
}
```

- 결과 1일 캐싱 (시험일정 자주 안 바뀜)

---

## 프로모션 (토스 포인트) 규칙

```ts
// ✅ 가능 — 참여/출석 기반 고정 지급
await AppInToss.grantPromotionReward({
  promotionCode: 'DAILY_VISIT_10P',
});

// ❌ 절대 금지
// - 분석 결과 점수에 따른 차등 포인트
// - 1인당 5,000P 초과
// - 확률형/랜덤 지급
// - 인게임 재화 → 토스 포인트 전환
```

## 링크

| 용도 | URL |
|------|-----|
| 큐넷 시험일정 API | https://openapi.hrdkorea.or.kr |
