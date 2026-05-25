/**
 * 큐넷 시험일정 API 클라이언트
 * 백엔드 프록시(/api/qnet)를 통해 호출합니다.
 */

const QNET_PROXY_URL = import.meta.env.VITE_QNET_PROXY_URL ?? '/api/qnet';
const QNET_FALLBACK_URL = 'https://www.q-net.or.kr/crf005.do';

export interface QnetScheduleResult {
  fallback: boolean;
  fallbackUrl?: string;
  data?: unknown;
}

/**
 * 자격증 코드로 시험 일정을 조회합니다.
 * API 실패 시 큐넷 직접 링크를 fallback으로 반환합니다.
 */
export async function getExamSchedule(qualCode: string): Promise<QnetScheduleResult> {
  try {
    const res = await fetch(`${QNET_PROXY_URL}?qualCode=${encodeURIComponent(qualCode)}`);
    const data = await res.json() as QnetScheduleResult;
    return data;
  } catch {
    return { fallback: true, fallbackUrl: QNET_FALLBACK_URL };
  }
}

/**
 * 자격증 이름으로 큐넷 검색 URL을 반환합니다. (빠른 링크용)
 */
export function getQnetSearchUrl(certName: string): string {
  return `https://www.q-net.or.kr/crf005.do?id=crf00500&gSite=Q&gId=&jmCd=&jmNm=${encodeURIComponent(certName)}`;
}
