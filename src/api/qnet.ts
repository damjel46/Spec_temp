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
 * @deprecated getQnetCertUrl 사용 권장
 */
export function getQnetSearchUrl(certName: string): string {
  return `https://www.q-net.or.kr/crf005.do?id=crf00500&gSite=Q&gId=&jmCd=&jmNm=${encodeURIComponent(certName)}`;
}

/**
 * 자격증 시험일정 직접 링크를 반환합니다.
 * - jmCd가 있으면 Q-net 시험일정 직접 페이지 (crf021.do)로 이동
 * - jmCd가 없으면 (민간자격 등) Q-net 종목 안내 메인으로 연결
 */
export function getQnetCertUrl(certName: string, jmCd?: string): string {
  if (jmCd) {
    return `https://www.q-net.or.kr/crf021.do?id=crf02100&jmCd=${encodeURIComponent(jmCd)}&gSite=Q`;
  }
  // 미매핑 민간자격: Q-net 종목 안내 메인 (이름 파라미터는 POST 폼 방식이라 URL로 작동 안 함)
  return `https://www.q-net.or.kr/crf005.do?id=crf00500&gSite=Q`;
}
