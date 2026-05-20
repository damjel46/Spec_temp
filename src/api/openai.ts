import OpenAI from 'openai';
import { CommonSpec, JobSpec, AnalysisResult } from '../types/spec';

const SYSTEM_PROMPT = `당신은 취업 스펙 분석 전문가입니다. 사용자의 스펙 정보를 분석하여 합격 가능성과 맞춤 로드맵을 제공합니다.

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
  ]
}

roadmap은 사용자 직군에 맞는 실제 자격증 3개로 구성하세요.`;

// VITE_OPENAI_API_KEY 환경변수 필요 (.env 파일에 설정)
const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
  dangerouslyAllowBrowser: true,
});

export async function analyzeSpec(commonSpec: CommonSpec, jobSpec: JobSpec): Promise<AnalysisResult> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ commonSpec, jobSpec }) },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('응답이 없어요');
  return JSON.parse(content) as AnalysisResult;
}
