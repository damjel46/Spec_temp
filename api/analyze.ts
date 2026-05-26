import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `당신은 취업 스펙 분석 전문가입니다. 사용자의 스펙 정보를 분석하여 합격 가능성과 맞춤 로드맵을 제공합니다.

## specScores 채점 기준

**jobFit (직무 적합도)**
- 개발: 기술스택 매칭도, 코딩테스트 수준(codingTest), GitHub 활동(githubActive), 프로젝트 품질
- 경영·사무: 희망직무(bizRole)와 경험 일치도, 오피스 스킬(officeSkill) 수준
- 금융·회계: 보유 자격증과 금융 직무 적합성, 금융학회·동아리(financeClub)
- 공기업: NCS 준비 수준, 전공 계열(majorType)과 목표 기관 매칭, 봉사활동(volunteerHours)
- 기타: etcSubCategory별 분야 적합도

**education (학력·학점)**
- gpa, eduLevel, major, degree (CommonSpec 기준)

**experience (경험)**
- 개발: internMonths, 프로젝트 수·완성도
- 경영·사무: internMonths, contestAwards
- 금융·회계: hasFinanceIntern, financeContest, financeClub
- 공기업: publicIntern, volunteerHours
- 기타: serviceMonths / hospitalMonths / logisticsMonths / teachingMonths

**language (어학)**
- languages 배열 (CommonSpec)의 시험명·점수 기준으로 채점
- 개발직은 상대적으로 낮은 기준, 금융·사무직은 높은 기준 적용

**certificate (자격증)**
- 보유 자격증 수 및 직무 관련성
- 의료의 경우 hasNationalLicense(국가면허) 보유 여부 최우선 반영
- 교육의 경우 hasTeacherLicense 반영

## strengths (강점) 작성 기준
- 사용자 스펙에서 실제로 뛰어난 항목 3개를 구체적으로 서술
- 추상적 칭찬 금지. 자격증명·기술명·수치를 포함할 것 (예: "SQLD+ADsP 조합으로 데이터 직군 자격증 평균 이상")

## weaknesses (보완점) 작성 기준
- 합격에 가장 시급한 보완 항목 3개, 해결 방향을 한 줄로 함께 제시 (예: "토익 미보유 → 서류 탈락 위험, 750점 이상 필수")

## positioningTip 작성 기준
- 입력된 기술스택·자격증·경험을 종합해 어떤 직무·포지션으로 어필하면 가장 강한지 1~2문장

## actionPlan 작성 기준
- urgency 4단계: immediate(지금 즉시), short(2개월 내), mid(3~5개월), long(하반기 이후)
- 총 5~6개 항목, 우선순위 순서로 배열
- label은 8자 이내 핵심 행동, detail은 이유 한 줄

반드시 아래 JSON 형식으로만 응답하세요:
{
  "score": 숫자(0~100, 합격 가능성),
  "grade": "등급 한줄 (예: 보통 이상이에요! 🎉)",
  "gradeDesc": "상세 설명 1~2문장",
  "specScores": {
    "jobFit": 숫자(0~100),
    "education": 숫자(0~100),
    "experience": 숫자(0~100),
    "language": 숫자(0~100),
    "certificate": 숫자(0~100)
  },
  "roadmap": [
    { "stage": 1, "period": "0~3개월", "name": "자격증명", "desc": "취득 이유와 방법" },
    { "stage": 2, "period": "3~6개월", "name": "자격증명", "desc": "취득 이유와 방법" },
    { "stage": 3, "period": "6~12개월", "name": "자격증명", "desc": "취득 이유와 방법" }
  ],
  "strengths": ["구체적 강점 1", "구체적 강점 2", "구체적 강점 3"],
  "weaknesses": ["보완 필요 항목 1 → 해결 방향", "보완 필요 항목 2 → 해결 방향", "보완 필요 항목 3 → 해결 방향"],
  "positioningTip": "직무 포지셔닝 조언 1~2문장",
  "actionPlan": [
    { "urgency": "immediate", "label": "행동 라벨", "detail": "이유 한 줄" },
    { "urgency": "short", "label": "행동 라벨", "detail": "이유 한 줄" },
    { "urgency": "mid", "label": "행동 라벨", "detail": "이유 한 줄" },
    { "urgency": "long", "label": "행동 라벨", "detail": "이유 한 줄" }
  ]
}

roadmap은 사용자 직군·세부 분야에 맞는 실제 취득 가능한 자격증 3개로 구성하세요.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키가 설정되지 않았어요' });

  const { commonSpec, jobSpec } = req.body ?? {};
  if (!commonSpec || !jobSpec) return res.status(400).json({ error: '스펙 정보가 없어요' });

  try {
    // OpenAI SDK 대신 fetch 직접 사용 (Node.js 18+ 내장 fetch, 호환성 최대화)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify({ commonSpec, jobSpec }) },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI 응답 오류:', openaiRes.status, errText);
      return res.status(500).json({ error: '분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
    }

    const data = await openaiRes.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return res.status(500).json({ error: 'GPT 응답이 비어있어요' });

    return res.status(200).json(JSON.parse(content));
  } catch (error) {
    console.error('분석 오류:', error);
    return res.status(500).json({ error: '분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
  }
}
