export type OPICLevel = 'NL' | 'NM' | 'NH' | 'IL' | 'IM1' | 'IM2' | 'IM3' | 'IH' | 'AL';
export type CompanyType = 'large' | 'mid' | 'startup' | 'public';
export type EduLevel = 'college' | 'graduate' | 'highschool';
export type SituationType = 'student' | 'jobseeker' | 'career';
export type JobType = 'dev' | 'biz' | 'finance' | 'public' | 'etc';

export interface LanguageEntry {
  test: string;
  score: string;
  date: string;
}

export interface CommonSpec {
  eduLevel: EduLevel;
  schoolName: string;
  major?: string;
  gpa?: number;
  degree?: '석사' | '박사';
  languages: LanguageEntry[];
  targetCompany: CompanyType;
  situation: SituationType;
  jobType: JobType;
  etcJobDesc?: string;
}

export interface DevSpec {
  codingTestLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  hasGithub: boolean;
  projectCount: number;
  cloudCerts: string[];
}

export interface BizSpec {
  internMonths: number;
  contestAwards: number;
  hasComputer1st: boolean;
  hasKoreanHistory: boolean;
}

export interface FinanceSpec {
  financeCerts: string[];
  hasFinanceIntern: boolean;
  accountingCerts: string[];
}

export interface PublicSpec {
  ncsLevel: 'none' | 'basic' | 'intermediate' | 'advanced';
  koreanHistoryLevel: number;
  targetPublicType: string;
}

export type CareerLevel = 'entry' | 'under1' | '1to3' | '3to5' | '5plus';

export interface ProjectEntry {
  name: string;
  github: string;
  desc: string;
  readme?: string;
  readmeStatus?: 'idle' | 'loading' | 'done' | 'error' | 'private';
}

export interface DevJobSpec {
  careerLevel: CareerLevel;
  techStack: string[];
  projects: ProjectEntry[];
  notes: string;
  certificates: string[];
}

export interface BizJobSpec {
  internMonths: number;
  contestAwards: number;
  certificates: string[];
}

export interface FinanceJobSpec {
  certificates: string[];
  hasFinanceIntern: boolean;
}

export interface PublicJobSpec {
  ncsLevel: 'none' | 'basic' | 'intermediate' | 'advanced';
  koreanHistoryLevel: number;
  targetPublicType: string;
  certificates: string[];
}

export interface EtcJobSpec {
  jobDesc: string;
  experience: string;
}

export type JobSpec = DevJobSpec | BizJobSpec | FinanceJobSpec | PublicJobSpec | EtcJobSpec;

export interface AnalysisResult {
  score: number;
  grade: string;
  gradeDesc: string;
  specScores: {
    jobFit: number;
    education: number;
    experience: number;
    language: number;
    certificate: number;
  };
  roadmap: Array<{
    stage: number;
    period: string;
    name: string;
    desc: string;
  }>;
}
