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
  '정보처리기사',
  '정보처리산업기사',
  '정보보안기사',
  '정보보안산업기사',
  'SQLD',
  'SQLP',
  'ADsP',
  'ADP',
  '네트워크관리사 2급',
  '리눅스마스터 1급',
  '리눅스마스터 2급',
  'AWS Solutions Architect',
  'AWS Developer',
  'GCP Associate',
  'Azure Fundamentals',
  'Docker',
  'Kubernetes(CKA)',
  'CCNA',
];

export const BIZ_CERTIFICATES: string[] = [
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
  '워드프로세서',
  '사무자동화산업기사',
  'MOS Master',
  'ADsP',
  '전산회계 1급',
  '전산세무 2급',
  'ERP정보관리사 1급',
  '유통관리사 2급',
  '물류관리사',
  'SMAT 1급',
  '한국사능력검정 1급',
  '한국사능력검정 2급',
  '한국사능력검정 3급',
  '비서 1급',
  '비서 2급',
];

export const FINANCE_CERTIFICATES: string[] = [
  'CFA Level 1',
  'CFA Level 2',
  'CFA Level 3',
  '투자자산운용사',
  '재무위험관리사(FRM)',
  '공인회계사(CPA)',
  '세무사',
  'AICPA',
  'AFPK',
  '신용분석사',
  '증권투자권유자문인력',
  '펀드투자권유자문인력',
  '재경관리사',
  '전산세무 1급',
  '전산세무 2급',
  '전산회계 1급',
];

export const PUBLIC_CERTIFICATES: string[] = [
  '정보처리기사',
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
  '전기기사',
  '토목기사',
  '건축기사',
  '기계기사',
  '화학분석기사',
  '환경기사',
  '위험물산업기사',
  '한국어능력시험 1급',
  '운전면허 1종 보통',
  '사회복지사 1급',
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
