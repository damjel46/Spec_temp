import { CommonSpec, JobSpec, AnalysisResult } from '../types/spec';

/**
 * OpenAI API를 백엔드 프록시를 통해 호출합니다.
 *
 * 보안: API 키를 클라이언트에 노출하지 않기 위해
 * 서버사이드 프록시(Vercel Functions 등)를 경유합니다.
 *
 * 환경변수: VITE_API_PROXY_URL (예: https://your-proxy.vercel.app/api/analyze)
 */
const API_PROXY_URL = import.meta.env.VITE_API_PROXY_URL ?? '/api/analyze';

export async function analyzeSpec(
  commonSpec: CommonSpec,
  jobSpec: JobSpec
): Promise<AnalysisResult> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(API_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commonSpec, jobSpec }),
        signal: AbortSignal.timeout(60_000), // 60초 타임아웃
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();
      return data as AnalysisResult;
    } catch (e) {
      // 마지막 시도에서도 실패하면 에러 전파
      if (attempt === 1) throw e;
      // 첫 번째 실패 시 1회 재시도
    }
  }

  throw new Error('분석에 실패했어요');
}
