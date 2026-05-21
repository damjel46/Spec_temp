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
  { label: '공기업', value: 'public' },
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
  'SQLD',
  'SQLP',
  'ADsP',
  'ADP',
  '네트워크관리사 2급',
  '정보보안기사',
  '리눅스마스터 1급',
  'AWS Solutions Architect',
  'AWS Developer',
  'GCP Associate',
  'Azure Fundamentals',
];

export const BIZ_CERTIFICATES: string[] = [
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
  '워드프로세서',
  '사무자동화산업기사',
  'MOS Master',
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
  '전산세무 1급',
  '전산세무 2급',
  '전산회계 1급',
  '재경관리사',
  'AFPK',
];

export const PUBLIC_CERTIFICATES: string[] = [
  '행정사',
  '사회복지사 1급',
  '컴퓨터활용능력 1급',
  '컴퓨터활용능력 2급',
];
