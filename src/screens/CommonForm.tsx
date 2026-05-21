import React, { useState } from 'react';
import {
  Top,
  ListHeader,
  ListRow,
  Border,
  TextField,
  BottomSheet,
  ProgressStepper,
  ProgressStep,
} from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

import { CommonSpec, CompanyType, SituationType, JobType, LanguageEntry, EduLevel } from '../types/spec';
import { SITUATION_TYPES, TARGET_COMPANY_TYPES, JOB_TYPES } from '../constants/jobTypes';

interface Props {
  onNext: (commonSpec: CommonSpec) => void;
}

const LANGUAGE_TESTS = [
  'TOEIC', 'TEPS', 'OPIc', 'TOEFL', 'IELTS', 'JPT', 'FLEX',
  'JLPT', 'HSK',
  '기타 직접 입력',
];

type LangInputType = 'score' | 'grade' | 'level';

const LANG_TYPE: Record<string, LangInputType> = {
  TOEIC: 'score', TEPS: 'score', TOEFL: 'score', IELTS: 'score', JPT: 'score', FLEX: 'score',
  OPIc: 'grade',
  JLPT: 'level',
  HSK: 'level',
};

const OPIC_GRADES = ['NL', 'NM', 'NH', 'IL', 'IM1', 'IM2', 'IM3', 'IH', 'AL'];
const JLPT_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5'];
const HSK_LEVELS = ['1급', '2급', '3급', '4급', '5급', '6급'];

const getLangType = (test: string): LangInputType => LANG_TYPE[test] ?? 'score';
const getLevels = (test: string) => test === 'JLPT' ? JLPT_LEVELS : test === 'HSK' ? HSK_LEVELS : [];

const LABEL: Record<string, Record<string, string>> = {
  situation: { student: '재학중', jobseeker: '취업준비', career: '이직' },
  company: { large: '대기업', mid: '중견기업', startup: '스타트업', public: '공기업' },
  job: { dev: '개발·IT', biz: '경영·사무', finance: '금융·회계', public: '공기업', etc: '기타' },
};


const ChevronRight = () => (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
    <path d="M1 1L7 7L1 13" stroke="#b0b8c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M12 4L4 12M4 4L12 12" stroke={colors.grey600} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EDU_TABS: { value: EduLevel; label: string }[] = [
  { value: 'college', label: '대학교' },
  { value: 'graduate', label: '대학원' },
  { value: 'highschool', label: '고등학교' },
];

export default function CommonForm({ onNext }: Props) {
  const [eduLevel, setEduLevel] = useState<EduLevel>('college');
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [gpa, setGpa] = useState('');
  const [degree, setDegree] = useState<'석사' | '박사' | ''>('');

  // 어학
  const [languages, setLanguages] = useState<LanguageEntry[]>([{ test: '', score: '', date: '' }]);
  const [langIsCustom, setLangIsCustom] = useState<boolean[]>([false]);
  const [langTestOpenIdx, setLangTestOpenIdx] = useState<number | null>(null);
  const [opicSheetIdx, setOpicSheetIdx] = useState<number | null>(null);
  const [levelSheetIdx, setLevelSheetIdx] = useState<number | null>(null);

  // 지원 정보
  const [targetCompany, setTargetCompany] = useState<CompanyType | null>(null);
  const [situation, setSituation] = useState<SituationType | null>(null);
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [etcJobDesc, setEtcJobDesc] = useState('');

  // UI
  const [situationOpen, setSituationOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [etcInputMode, setEtcInputMode] = useState(false);
  const [etcInputTemp, setEtcInputTemp] = useState('');
  const [gpaError, setGpaError] = useState<string | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!schoolName.trim()) missing.push('학교명');
    if (eduLevel !== 'highschool' && !major.trim()) missing.push('전공');
    if (eduLevel !== 'highschool' && (!gpa.trim() || isNaN(parseFloat(gpa)) || parseFloat(gpa) < 0 || parseFloat(gpa) > 4.5)) missing.push('학점');
    if (eduLevel === 'graduate' && !degree) missing.push('학위');
    if (!situation) missing.push('현재 상황');
    if (!jobType) missing.push('지원 직무');
    if (jobType === 'etc' && !etcJobDesc.trim()) missing.push('직무명 (기타)');
    return missing;
  };

  const handleGpaBlur = () => {
    if (eduLevel === 'highschool') return;
    const g = parseFloat(gpa);
    if (gpa.trim() && (isNaN(g) || g < 0 || g > 4.5)) {
      setGpaError('0.0~4.5 범위로 입력해주세요');
    } else {
      setGpaError(null);
    }
  };

  /* ── 어학 ── */
  const updateLang = (idx: number, field: keyof LanguageEntry, value: string) =>
    setLanguages(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const addLang = () => {
    setLanguages(prev => [...prev, { test: '', score: '', date: '' }]);
    setLangIsCustom(prev => [...prev, false]);
  };

  const deleteLang = (idx: number) => {
    setLanguages(prev => prev.filter((_, i) => i !== idx));
    setLangIsCustom(prev => prev.filter((_, i) => i !== idx));
  };

  const selectLangTest = (idx: number, test: string) => {
    if (test === '기타 직접 입력') {
      setLangIsCustom(prev => prev.map((v, i) => i === idx ? true : v));
      updateLang(idx, 'test', '');
    } else {
      setLangIsCustom(prev => prev.map((v, i) => i === idx ? false : v));
      updateLang(idx, 'test', test);
    }
    updateLang(idx, 'score', '');
    setLangTestOpenIdx(null);
  };

  /* ── 제출 ── */
  const handleSubmit = () => {
    if (getMissingFields().length > 0) {
      setValidationOpen(true);
      return;
    }
    onNext({
      eduLevel,
      schoolName: schoolName.trim(),
      major: eduLevel !== 'highschool' ? major.trim() : undefined,
      gpa: eduLevel !== 'highschool' ? parseFloat(gpa) : undefined,
      degree: eduLevel === 'graduate' ? (degree as '석사' | '박사') : undefined,
      languages: languages.filter(l => l.test && !!l.score),
      targetCompany: targetCompany ?? 'large',
      situation: situation!,
      jobType: jobType!,
      etcJobDesc: jobType === 'etc' ? etcJobDesc.trim() : undefined,
    });
  };

  const anySheetOpen = situationOpen || companyOpen || jobTypeOpen || langTestOpenIdx !== null || opicSheetIdx !== null || levelSheetIdx !== null || validationOpen;

  return (
    <div style={s.container}>
      {anySheetOpen && <div style={s.dimmer} />}
      <div style={s.scrollContent}>
        <Top
          subtitleTop={<span style={{ color: colors.blue500, fontSize: 13, fontWeight: 600 }}>STEP 1</span>}
          title="기본 정보 입력"
          subtitleBottom={<span style={{ color: colors.grey600 }}>취업에 필요한 기본 스펙을 입력해주세요</span>}
        />

        <ProgressStepper variant="compact" activeStepIndex={0} style={s.stepper}>
          <ProgressStep title="기본 정보" />
          <ProgressStep title="직군 정보" />
        </ProgressStepper>

        {/* 학력 */}
        <ListHeader title="학력" />

        {/* 학력 탭 */}
        <div style={s.eduTabRow}>
          {EDU_TABS.map(tab => (
            <button
              key={tab.value}
              style={{ ...s.eduTab, ...(eduLevel === tab.value ? s.eduTabActive : {}) }}
              onClick={() => { setEduLevel(tab.value); setMajor(''); setGpa(''); setDegree(''); setGpaError(null); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={s.inputWrap} className="always-blue-line">
          <span style={s.inputLabel}>학교명</span>
          <TextField variant="line" value={schoolName}
            onChange={e => setSchoolName(e.target.value)} placeholder="학교명을 입력해주세요" />
        </div>

        {eduLevel !== 'highschool' && (
          <>
            <div style={s.inputWrap} className="always-blue-line">
              <span style={s.inputLabel}>전공</span>
              <TextField variant="line" value={major}
                onChange={e => setMajor(e.target.value)} placeholder="전공을 입력해주세요" />
            </div>
            <div style={s.inputWrap} className="always-blue-line">
              <span style={s.inputLabel}>학점 (4.5 기준)</span>
              <TextField variant="line" value={gpa}
                onChange={e => setGpa(e.target.value)} onBlur={handleGpaBlur}
                inputMode="decimal" placeholder="예) 3.8" hasError={!!gpaError}
                help={gpaError ? <span style={{ color: colors.red500, fontSize: 12 }}>{gpaError}</span> : undefined}
              />
            </div>
          </>
        )}

        {eduLevel === 'graduate' && (
          <div style={s.degreeRow}>
            {(['석사', '박사'] as const).map(d => (
              <button
                key={d}
                style={{ ...s.eduTab, ...(degree === d ? s.eduTabActive : {}) }}
                onClick={() => setDegree(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* 어학 */}
        <ListHeader title="어학" />
        {languages.map((lang, idx) => (
          <div key={idx} style={s.langCard}>
            {/* 삭제 버튼 */}
            <div style={s.langCardHeader}>
              <span style={s.langCardTitle}>어학 {idx + 1}</span>
              <button style={s.deleteBtn} onClick={() => deleteLang(idx)}>
                <CloseIcon />
              </button>
            </div>

            {/* 시험 선택 */}
            <ListRow
              onClick={() => setLangTestOpenIdx(idx)}
              left={
                <span style={lang.test ? s.selectedValue : s.rowLabel}>
                  {lang.test || '시험 종류'}
                </span>
              }
              right={
                <div style={s.rowRight}>
                  <span style={s.placeholderValue}>선택</span>
                  <ChevronRight />
                </div>
              }
            />

            {/* 기타 직접 입력 */}
            {langIsCustom[idx] && (
              <ListRow left={
                <TextField variant="line" label="시험명" value={lang.test}
                  onChange={e => updateLang(idx, 'test', e.target.value)}
                  placeholder="예) TOEFL, G-TELP 등" />
              } />
            )}

            {/* 점수형 */}
            {(lang.test || langIsCustom[idx]) && getLangType(lang.test) === 'score' && (
              <div style={s.langScoreWrap}>
                <div style={s.langScoreRow}>
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>점수</span>
                    <TextField variant="line" value={lang.score}
                      onChange={e => updateLang(idx, 'score', e.target.value)}
                      inputMode="decimal" placeholder="예) 900" />
                  </div>
                  <div style={s.langDivider} />
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>취득일 (선택)</span>
                    <input type="month" style={s.monthInput}
                      value={lang.date ? lang.date.replace('.', '-') : ''}
                      onChange={e => updateLang(idx, 'date', e.target.value.replace('-', '.'))} />
                  </div>
                </div>
              </div>
            )}

            {/* 등급형 (OPIc) */}
            {lang.test && getLangType(lang.test) === 'grade' && (
              <div style={s.langScoreWrap}>
                <div style={s.langScoreRow}>
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>등급</span>
                    <div style={s.langSelector} onClick={() => setOpicSheetIdx(idx)}>
                      <span style={lang.score ? s.selectedValue : s.placeholderValue}>{lang.score || '선택'}</span>
                      <ChevronRight />
                    </div>
                  </div>
                  <div style={s.langDivider} />
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>취득일 (선택)</span>
                    <input type="month" style={s.monthInput}
                      value={lang.date ? lang.date.replace('.', '-') : ''}
                      onChange={e => updateLang(idx, 'date', e.target.value.replace('-', '.'))} />
                  </div>
                </div>
              </div>
            )}

            {/* 급수형 (JLPT, HSK) */}
            {lang.test && getLangType(lang.test) === 'level' && (
              <div style={s.langScoreWrap}>
                <div style={s.langScoreRow}>
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>급수</span>
                    <div style={s.langSelector} onClick={() => setLevelSheetIdx(idx)}>
                      <span style={lang.score ? s.selectedValue : s.placeholderValue}>{lang.score || '선택'}</span>
                      <ChevronRight />
                    </div>
                  </div>
                  <div style={s.langDivider} />
                  <div style={{ flex: 1 }}>
                    <span style={s.fieldLabel}>취득일 (선택)</span>
                    <input type="month" style={s.monthInput}
                      value={lang.date ? lang.date.replace('.', '-') : ''}
                      onChange={e => updateLang(idx, 'date', e.target.value.replace('-', '.'))} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <ListRow onClick={addLang} left={<span style={s.addBtn}>+ 어학 추가</span>} />

        {/* 지원 정보 */}
        <ListHeader title="지원 정보" />
        <ListRow
          onClick={() => setSituationOpen(true)}
          left={<span style={s.rowLabel}>현재 상황</span>}
          right={<div style={s.rowRight}><span style={situation ? s.selectedValue : s.placeholderValue}>{situation ? LABEL.situation[situation] : '선택'}</span><ChevronRight /></div>}
        />
        <ListRow
          onClick={() => setCompanyOpen(true)}
          left={<span style={s.rowLabel}>지원 기업 (선택)</span>}
          right={<div style={s.rowRight}><span style={targetCompany ? s.selectedValue : s.placeholderValue}>{targetCompany ? LABEL.company[targetCompany] : '선택'}</span><ChevronRight /></div>}
        />
        <ListRow
          onClick={() => setJobTypeOpen(true)}
          left={<span style={s.rowLabel}>지원 직무</span>}
          right={<div style={s.rowRight}><span style={jobType ? s.selectedValue : s.placeholderValue}>{jobType === 'etc' ? (etcJobDesc || '기타') : (jobType ? LABEL.job[jobType] : '선택')}</span><ChevronRight /></div>}
        />
      </div>

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={handleSubmit}>다음</button>
      </div>

      {/* JLPT·HSK 급수 선택 BottomSheet */}
      <BottomSheet open={levelSheetIdx !== null} onDimmerClick={() => setLevelSheetIdx(null)}>
        <BottomSheet.Header>{languages[levelSheetIdx ?? 0]?.test} 급수 선택</BottomSheet.Header>
        {getLevels(languages[levelSheetIdx ?? 0]?.test ?? '').map(level => {
          const idx = levelSheetIdx ?? 0;
          return (
            <ListRow key={level}
              onClick={() => { updateLang(idx, 'score', level); setLevelSheetIdx(null); }}
              left={<span style={s.rowLabel}>{level}</span>}
              right={languages[idx]?.score === level ? <span style={s.checkmark}>✓</span> : null}
            />
          );
        })}
      </BottomSheet>

      {/* OPIc 등급 선택 BottomSheet */}
      <BottomSheet open={opicSheetIdx !== null} onDimmerClick={() => setOpicSheetIdx(null)}>
        <BottomSheet.Header>OPIc 등급 선택</BottomSheet.Header>
        {OPIC_GRADES.map(grade => {
          const idx = opicSheetIdx ?? 0;
          return (
            <ListRow key={grade}
              onClick={() => { updateLang(idx, 'score', grade); setOpicSheetIdx(null); }}
              left={<span style={s.rowLabel}>{grade}</span>}
              right={languages[idx]?.score === grade ? <span style={s.checkmark}>✓</span> : null}
            />
          );
        })}
      </BottomSheet>

      {/* 어학 시험 선택 BottomSheet */}
      <BottomSheet open={langTestOpenIdx !== null} onDimmerClick={() => setLangTestOpenIdx(null)}>
        <BottomSheet.Header>시험 종류 선택</BottomSheet.Header>
        {LANGUAGE_TESTS.map(test => {
          const idx = langTestOpenIdx ?? 0;
          const isSelected = test === '기타 직접 입력'
            ? langIsCustom[idx]
            : languages[idx]?.test === test;
          return (
            <ListRow
              key={test}
              onClick={() => selectLangTest(idx, test)}
              left={<span style={test === '기타 직접 입력' ? { ...s.rowLabel, color: colors.blue500 } : s.rowLabel}>{test}</span>}
              right={isSelected ? <span style={s.checkmark}>✓</span> : null}
            />
          );
        })}
      </BottomSheet>

      {/* 현재 상황 */}
      <BottomSheet open={situationOpen} onDimmerClick={() => setSituationOpen(false)}>
        <BottomSheet.Header>현재 상황</BottomSheet.Header>
        {SITUATION_TYPES.map(item => (
          <ListRow key={item.value} onClick={() => { setSituation(item.value); setSituationOpen(false); }}
            left={<span style={s.rowLabel}>{item.label}</span>}
            right={situation === item.value ? <span style={s.checkmark}>✓</span> : null} />
        ))}
      </BottomSheet>

      {/* 지원 기업 */}
      <BottomSheet open={companyOpen} onDimmerClick={() => setCompanyOpen(false)}>
        <BottomSheet.Header>지원 기업</BottomSheet.Header>
        {TARGET_COMPANY_TYPES.map(item => (
          <ListRow key={item.value} onClick={() => { setTargetCompany(item.value); setCompanyOpen(false); }}
            left={<span style={s.rowLabel}>{item.label}</span>}
            right={targetCompany === item.value ? <span style={s.checkmark}>✓</span> : null} />
        ))}
      </BottomSheet>

      {/* 미입력 항목 안내 */}
      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          {getMissingFields().map(field => (
            <div key={field} style={s.missingItem}>
              <span style={s.missingDot}>•</span>
              <span style={s.missingText}>{field}</span>
            </div>
          ))}
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>

      {/* 지원 직무 */}
      <BottomSheet open={jobTypeOpen} onDimmerClick={() => { setJobTypeOpen(false); setEtcInputMode(false); }}>
        <BottomSheet.Header>지원 직무</BottomSheet.Header>
        {!etcInputMode
          ? JOB_TYPES.map(item => (
              <ListRow key={item.value}
                onClick={() => {
                  if (item.value === 'etc') {
                    setEtcInputTemp(etcJobDesc);
                    setEtcInputMode(true);
                  } else {
                    setJobType(item.value);
                    setJobTypeOpen(false);
                  }
                }}
                left={<span style={s.rowLabel}>{item.label}</span>}
                right={jobType === item.value ? <span style={s.checkmark}>✓</span> : null} />
            ))
          : <div style={s.etcInputWrap} className="always-blue-line">
              <span style={s.inputLabel}>직무명 입력</span>
              <TextField variant="line" value={etcInputTemp}
                onChange={e => setEtcInputTemp(e.target.value)}
                placeholder="예) 마케터, UX 디자이너 등" />
            </div>
        }
        {etcInputMode && (
          <BottomSheet.CTA onClick={() => { setJobType('etc'); setEtcJobDesc(etcInputTemp); setEtcInputMode(false); setJobTypeOpen(false); }}
            disabled={!etcInputTemp.trim()}>
            확인
          </BottomSheet.CTA>
        )}
      </BottomSheet>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { position: 'relative', maxWidth: 375, margin: '0 auto', minHeight: '100vh' },
  dimmer: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  scrollContent: { paddingBottom: 120 },
  stepper: { padding: '8px 24px 0' },
  rowLabel: { fontSize: 16, color: colors.grey900 },
  selectedValue: { fontSize: 16, color: colors.blue500, fontWeight: 500 },
  placeholderValue: { fontSize: 14, color: colors.grey600 },
  checkmark: { fontSize: 16, color: colors.blue500, fontWeight: 700 },
  addBtn: { fontSize: 15, color: colors.blue500, fontWeight: 500 },
  rowRight: { display: 'flex', alignItems: 'center', gap: 6 },
  eduTabRow: { display: 'flex', gap: 8, padding: '8px 16px 4px' },
  degreeRow: { display: 'flex', gap: 8, padding: '4px 16px 8px' },
  eduTab: {
    height: 36,
    padding: '0 16px',
    borderRadius: 18,
    border: `1px solid ${colors.grey200}`,
    background: '#fff',
    fontSize: 14,
    color: colors.grey600,
    cursor: 'pointer',
    fontWeight: 500,
  },
  eduTabActive: {
    border: `1px solid ${colors.blue500}`,
    background: '#e8f3ff',
    color: colors.blue500,
  },
  inputWrap: {
    margin: '4px 16px',
    border: `1px solid ${colors.grey100}`,
    borderRadius: 8,
    padding: '8px 12px 4px',
  },
  inputLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: colors.grey600,
    marginBottom: 2,
  },
  langCard: {
    margin: '8px 16px',
    border: `1px solid ${colors.grey100}`,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
  },
  langCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px 4px',
  },
  langCardTitle: { fontSize: 13, fontWeight: 600, color: colors.grey600 },
  deleteBtn: {
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  langScoreWrap: { padding: '2px 16px 12px' },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: colors.grey600, marginBottom: 2 },
  langScoreRow: { display: 'flex', alignItems: 'flex-start', gap: 8, width: '100%' },
  langSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    borderBottom: `1px solid ${colors.grey200}`,
    cursor: 'pointer',
  },
  monthInput: {
    width: '100%',
    height: 40,
    border: 'none',
    borderBottom: `1px solid ${colors.grey200}`,
    outline: 'none',
    fontSize: 14,
    color: colors.grey900,
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
  },
  langDivider: { width: 1, height: 32, background: colors.grey100, flexShrink: 0 },
  etcInputWrap: { margin: '8px 16px 16px', padding: '8px 12px 4px', border: `1px solid ${colors.grey100}`, borderRadius: 8 },
  missingItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' },
  missingDot: { fontSize: 16, color: colors.red500, lineHeight: 1 },
  missingText: { fontSize: 15, color: colors.grey900 },
  bottomBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 375,
    padding: '12px 24px 28px',
    background: '#fff',
    boxSizing: 'border-box' as const,
  },
  nextBtn: {
    width: '100%',
    height: 52,
    background: colors.blue500,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
  },
};
