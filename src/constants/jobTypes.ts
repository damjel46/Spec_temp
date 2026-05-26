import { OPICLevel, CompanyType, SituationType, JobType } from '../types/spec';

export const SITUATION_TYPES: { label: string; value: SituationType }[] = [
  { label: '재학중', value: 'student' },
  { label: '취업준비', value: 'jobseeker' },
  { label: '이직', value: 'career' },
];

export const TARGET_COMPANY_TYPES: { label: string; value: CompanyType }[] = [
  { label: '대기업', value: 'large' },
  { label: '중견기업', value: 'mid' },
  { label: '스타트업', value: 'startup' },
  { label: '공기업', value: 'public' },
];

export const JOB_TYPES: { label: string; value: JobType }[] = [
  { label: '개발·IT', value: 'dev' },
  { label: '경영·사무', value: 'biz' },
  { label: '금융·회계', value: 'finance' },
  { label: '기타', value: 'etc' },
];

export const OPIC_LEVELS: { label: string; value: OPICLevel }[] = [
  { label: 'NL', value: 'NL' },
  { label: 'NM', value: 'NM' },
  { label: 'NH', value: 'NH' },
  { label: 'IL', value: 'IL' },
  { label: 'IM1', value: 'IM1' },
  { label: 'IM2', value: 'IM2' },
  { label: 'IM3', value: 'IM3' },
  { label: 'IH', value: 'IH' },
  { label: 'AL', value: 'AL' },
];

export const DEV_CERTIFICATES: string[] = [
  // 국가기술자격
  '정보처리기능사',
  '정보처리산업기사',
  '정보처리기사',
  '정보보안산업기사',
  '정보보안기사',
  '빅데이터분석기사',
  '정보통신기사',
  // DB
  'SQLD',
  'SQLP',
  'ADsP',
  'ADP',
  'OCP(Oracle Certified Professional)',
  'MongoDB Associate',
  // 네트워크
  '네트워크관리사 2급',
  '네트워크관리사 1급',
  'CCNA',
  'CCNP',
  // AWS
  'AWS Solutions Architect',
  'AWS Solutions Architect Professional',
  'AWS Developer',
  'AWS SysOps Administrator',
  // Azure
  'Azure Fundamentals',
  'Azure Administrator(AZ-104)',
  'Azure Solutions Architect Expert(AZ-305)',
  // GCP
  'GCP Associate',
  'GCP Professional',
  // Container / Kubernetes
  'Docker',
  'Kubernetes(CKA)',
  'CKAD',
  'CKS',
  // 국내 클라우드
  'NCP(네이버클라우드 Associate)',
  'NCA(네이버클라우드 Architect)',
  // 리눅스
  '리눅스마스터 2급',
  '리눅스마스터 1급',
  // 기타
  'ISTQB',
  'Terraform Associate',
];

export const BIZ_CERTIFICATES: string[] = [
  // OA
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
  '워드프로세서',
  '사무자동화산업기사',
  '사무자동화기능사',
  'MOS Master',
  'ITQ Master',
  'GTQ 1급',
  'ICDL',
  // 데이터·분석
  'ADsP',
  '사회조사분석사 2급',
  // 회계·세무
  '전산회계 1급',
  '전산세무 2급',
  '재경관리사',
  // ERP
  'ERP정보관리사 1급',
  'ERP인사정보관리사 1급',
  'ERP물류정보관리사',
  // 유통·물류
  '유통관리사 2급',
  '유통관리사 1급',
  '물류관리사',
  '전자상거래관리사 2급',
  '전자상거래관리사 1급',
  // 마케팅·서비스
  'SMAT 1급',
  // 한국사
  '한국사능력검정 1급',
  '한국사능력검정 2급',
  '한국사능력검정 3급',
  // 국어·문서
  'KBS한국어능력시험',
  '국어능력인증시험(ToKL)',
  '한국실용글쓰기',
  // 비서
  '비서 1급',
  '비서 2급',
];

export const FINANCE_CERTIFICATES: string[] = [
  // CFA 계열
  'CFA Level 1',
  'CFA Level 2',
  'CFA Level 3',
  '국제공인투자분석사(CIIA)',
  // 투자·운용
  '투자자산운용사',
  '파생상품투자권유자문인력',
  '증권투자권유자문인력',
  '펀드투자권유자문인력',
  '채권분석사',
  '금융투자분석사(CRA)',
  // 리스크·신용
  '재무위험관리사(FRM)',
  'PRM',
  '신용분석사',
  '신용위험분석사',
  // 회계·세무
  '공인회계사(CPA)',
  'AICPA',
  '세무사',
  // 재무·기획
  '재경관리사',
  'AFPK',
  'CFP(국제공인재무설계사)',
  // 보험
  '보험계리사',
  '손해사정사',
  '보험심사역(CPCM)',
  // 부동산·기타
  '감정평가사',
  '공인중개사',
  '외환관리사',
  'ISA',
  // 전산
  '전산세무 1급',
  '전산세무 2급',
  '전산회계 1급',
];

export const PUBLIC_CERTIFICATES: string[] = [
  // IT·데이터
  '정보처리기사',
  '정보통신기사',
  '빅데이터분석기사',
  // 전기
  '전기기사',
  '전기산업기사',
  // 안전
  '산업안전기사',
  '산업안전산업기사',
  // 소방
  '소방설비기사',
  '소방설비산업기사',
  // 건설·토목
  '토목기사',
  '건축기사',
  '도시계획기사',
  // 기계
  '기계기사',
  // 환경
  '환경기사',
  '대기환경기사',
  '수질환경기사',
  // 화학·가스
  '화학분석기사',
  '가스기사',
  '위험물산업기사',
  // 품질·측량
  '품질경영기사',
  '측량및지형공간정보기사',
  // OA·회계·행정
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
  '전산세무 1급',
  '전산회계 1급',
  '재경관리사',
  // 한국어
  '한국어능력시험 1급',
  // 운전·복지·행정
  '운전면허 1종 보통',
  '사회복지사 1급',
  '사회복지사 2급',
  '행정사',
];

export const ETC_CERTIFICATES: Record<string, string[]> = {
  service: ['서비스경영사', '조주기능사', '바리스타 2급', '관광통역안내사', '호텔관리사'],
  medical: ['간호사', '임상병리사', '방사선사', '물리치료사', '치과위생사', '응급구조사', '약사'],
  logistics: ['물류관리사', '유통관리사 2급', '운전면허 1종 보통', '지게차운전기능사', '위험물산업기사'],
  education: ['교원자격증(중등)', '교원자격증(초등)', '평생교육사 2급', '사회복지사 1급'],
  other: [],
};

export const BIZ_ROLES: { label: string; value: string }[] = [
  { label: '경영기획', value: '경영기획' },
  { label: '인사·HR', value: '인사·HR' },
  { label: '마케팅', value: '마케팅' },
  { label: '영업', value: '영업' },
  { label: '총무·구매', value: '총무·구매' },
  { label: '기타', value: '기타' },
];
