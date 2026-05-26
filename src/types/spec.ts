export type OPICLevel = 'NL' | 'NM' | 'NH' | 'IL' | 'IM1' | 'IM2' | 'IM3' | 'IH' | 'AL';
export type CompanyType = 'large' | 'mid' | 'startup' | 'public';
export type EduLevel = 'college' | 'graduate' | 'highschool';
export type SituationType = 'student' | 'jobseeker' | 'career';
export type JobType = 'dev' | 'biz' | 'finance' | 'etc';
export type CareerLevel = 'entry' | 'under1' | '1to3' | '3to5' | '5plus';
export type CodingTestLevel = 'none' | 'basic' | 'intermediate' | 'advanced';
export type OfficeSkillLevel = 'none' | 'basic' | 'intermediate' | 'advanced';
export type MajorType = 'engineering' | 'business' | 'humanities' | 'other';
export type EtcSubCategory = 'service' | 'medical' | 'logistics' | 'education' | 'other';

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

export interface ProjectEntry {
  name: string;
  github: string;
  desc: string;
  readme?: string;
  readmeStatus?: 'idle' | 'loading' | 'done' | 'error' | 'private';
}

export interface DevJobSpec {
  careerLevel: CareerLevel;
  codingTest: CodingTestLevel;
  githubActive: boolean;
  internMonths: number;
  techStack: string[];
  projects: ProjectEntry[];
  notes: string;
  certificates: string[];
  publicInfo?: PublicInfo;
}

export interface BizJobSpec {
  bizRole: string;
  officeSkill: OfficeSkillLevel;
  internMonths: number;
  contestAwards: number;
  certificates: string[];
  publicInfo?: PublicInfo;
}

export interface FinanceJobSpec {
  certificates: string[];
  hasFinanceIntern: boolean;
  financeContest: boolean;
  financeClub: boolean;
  publicInfo?: PublicInfo;
}

export interface PublicInfo {
  ncsLevel: 'none' | 'basic' | 'intermediate' | 'advanced';
  koreanHistoryLevel: number;
  targetPublicType: string;
  majorType: MajorType;
  volunteerHours: number;
  publicIntern: boolean;
  certificates: string[];
}

export interface EtcJobSpec {
  jobDesc: string;
  etcSubCategory: EtcSubCategory;
  certificates: string[];
  experience: string;
  // 서비스업
  speakingGrade?: string;
  serviceMonths?: number;
  // 의료·보건
  hasNationalLicense?: boolean;
  hospitalMonths?: number;
  // 유통·물류
  logisticsMonths?: number;
  // 교육
  hasTeacherLicense?: boolean;
  teachingMonths?: number;
  publicInfo?: PublicInfo;
}

export type JobSpec = DevJobSpec | BizJobSpec | FinanceJobSpec | EtcJobSpec;

export interface CertExamSchedule {
  implYy: string;
  implSeq: number;
  description: string;
  docExamStartDt?: string;
  pracExamStartDt?: string;
}

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
