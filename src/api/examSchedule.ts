export interface ExamSchedule {
  implYy: string;
  implSeq: number;
  description: string;
  docExamStartDt?: string;
  docExamEndDt?: string;
  pracExamStartDt?: string;
  pracExamEndDt?: string;
}

const CACHE_TTL = 24 * 60 * 60 * 1000;

function cacheKey(jmCd: string, year: number) {
  return `qnet_schedule_${jmCd}_${year}`;
}

function readCache(key: string): ExamSchedule | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data as ExamSchedule;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: ExamSchedule) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() }));
  } catch { /* localStorage quota 초과 무시 */ }
}

// YYYYMMDD → "YYYY.MM.DD"
export function formatDate(d?: string): string {
  if (!d || d.length < 8) return '';
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;
}

// 오늘 이후인지 확인
function isFuture(dt?: string): boolean {
  if (!dt || dt.length < 8) return false;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return dt >= today;
}

// 개발환경에서는 Vite proxy('/qnet-api') 사용, 프로덕션(WebView)에서는 직접 호출
function buildUrl(jmCd: string, qualgbCd: string, year: number): string {
  const key = import.meta.env.VITE_QNET_API_KEY ?? '';
  const params = new URLSearchParams({
    serviceKey: key,
    numOfRows: '10',
    pageNo: '1',
    dataFormat: 'json',
    implYy: String(year),
    qualgbCd,
    jmCd,
  });
  const base = import.meta.env.DEV
    ? '/qnet-api/B490007/qualExamSchd/getQualExamSchdList'
    : 'https://apis.data.go.kr/B490007/qualExamSchd/getQualExamSchdList';
  return `${base}?${params.toString()}`;
}

export async function fetchNextExamSchedule(
  jmCd: string,
  qualgbCd = 'T',
): Promise<ExamSchedule | null> {
  const year = new Date().getFullYear();
  const key = cacheKey(jmCd, year);
  const cached = readCache(key);
  if (cached) return cached;

  try {
    const res = await fetch(buildUrl(jmCd, qualgbCd, year));
    if (!res.ok) return null;

    const json = await res.json();
    const items: ExamSchedule[] = json?.body?.items ?? [];
    if (!items.length) return null;

    // 필기 또는 실기 시험일이 오늘 이후인 첫 번째 회차를 반환
    const next = items.find(
      (i) => isFuture(i.docExamStartDt) || isFuture(i.pracExamStartDt),
    ) ?? items[0];

    writeCache(key, next);
    return next;
  } catch {
    return null;
  }
}
