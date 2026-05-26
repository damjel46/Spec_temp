// Q-net 국가기술자격 종목코드 (jmCd) 매핑
// qualgbCd: T=국가기술자격, S=국가전문자격
// 이 API에 없는 민간자격(SQLD, 컴활, CFA, MOS 등)은 매핑하지 않음 → null 반환되어 배지 미표시
export const CERT_CODE_MAP: Record<string, { jmCd: string; qualgbCd: string }> = {
  // ── 개발·IT (국가기술자격 T) ──────────────────────────────
  '정보처리기사':          { jmCd: '1320', qualgbCd: 'T' },
  '정보처리산업기사':      { jmCd: '1321', qualgbCd: 'T' },
  '정보보안기사':          { jmCd: '2170', qualgbCd: 'T' },
  '정보보안산업기사':      { jmCd: '2171', qualgbCd: 'T' },
  '빅데이터분석기사':      { jmCd: '1370', qualgbCd: 'T' },

  // ── 전기·전자 ─────────────────────────────────────────────
  '전기기사':              { jmCd: '2101', qualgbCd: 'T' },
  '전기산업기사':          { jmCd: '2102', qualgbCd: 'T' },
  '전자기사':              { jmCd: '2121', qualgbCd: 'T' },

  // ── 건설·토목·건축 ────────────────────────────────────────
  '토목기사':              { jmCd: '1380', qualgbCd: 'T' },
  '토목산업기사':          { jmCd: '1381', qualgbCd: 'T' },
  '건축기사':              { jmCd: '1340', qualgbCd: 'T' },
  '건축산업기사':          { jmCd: '1341', qualgbCd: 'T' },

  // ── 기계·화학·환경 ────────────────────────────────────────
  '기계기사':              { jmCd: '1350', qualgbCd: 'T' },
  '화학분석기사':          { jmCd: '2193', qualgbCd: 'T' },
  '환경기사':              { jmCd: '1390', qualgbCd: 'T' },
  '위험물산업기사':        { jmCd: '2140', qualgbCd: 'T' },

  // ── 서비스·조리·물류 (기능사) ────────────────────────────
  '조주기능사':            { jmCd: '7920', qualgbCd: 'T' },
  '한식조리기능사':        { jmCd: '7910', qualgbCd: 'T' },
  '지게차운전기능사':      { jmCd: '6370', qualgbCd: 'T' },
};
