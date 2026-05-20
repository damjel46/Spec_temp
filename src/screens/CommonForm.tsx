import React, { useState, useMemo } from 'react';
import {
  Top,
  ListHeader,
  ListRow,
  Border,
  TextField,
  BottomSheet,
  FixedBottomCTA,
  ProgressStepper,
  ProgressStep,
} from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

import { CommonSpec, CompanyType, SituationType, JobType, LanguageEntry } from '../types/spec';
import { SITUATION_TYPES, TARGET_COMPANY_TYPES, JOB_TYPES, COMMON_CERTIFICATES } from '../constants/jobTypes';

interface Props {
  onNext: (commonSpec: CommonSpec) => void;
}

const LANGUAGE_TESTS = ['TOEIC', 'OPIc', 'TEPS', 'JLPT N1', 'JLPT N2', 'HSK 5급', 'HSK 6급', '기타 직접 입력'];

const LABEL: Record<string, Record<string, string>> = {
  situation: { student: '재학중', jobseeker: '취업준비', career: '이직' },
  company: { large: '대기업', mid: '중견기업', startup: '스타트업', public: '공기업' },
  job: { dev: '개발·IT', biz: '경영·사무', finance: '금융·회계', public: '공기업', etc: '기타' },
};

const SectionGap = () => <div style={{ height: 8, background: '#f2f4f6' }} />;

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

export default function CommonForm({ onNext }: Props) {
  const [schoolName, setSchoolName] = useState('');
  const [major, setMajor] = useState('');
  const [gpa, setGpa] = useState('');

  // 어학
  const [languages, setLanguages] = useState<LanguageEntry[]>([{ test: '', score: '', date: '' }]);
  const [langIsCustom, setLangIsCustom] = useState<boolean[]>([false]);
  const [langTestOpenIdx, setLangTestOpenIdx] = useState<number | null>(null);

  // 자격증
  const [certificates, setCertificates] = useState<string[]>([]);
  const [certSheetOpen, setCertSheetOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');

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

  /* ── 유효성 ── */
  const isValid = useMemo(() => {
    if (!schoolName.trim() || !major.trim() || !gpa.trim()) return false;
    if (!situation || !jobType) return false;
    if (jobType === 'etc' && !etcJobDesc.trim()) return false;
    const g = parseFloat(gpa);
    if (isNaN(g) || g < 0 || g > 4.5) return false;
    return true;
  }, [schoolName, major, gpa, situation, jobType, etcJobDesc]);

  const handleGpaBlur = () => {
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
    setLangTestOpenIdx(null);
  };

  /* ── 자격증 ── */
  const filteredCerts = COMMON_CERTIFICATES.filter(c =>
    c.toLowerCase().includes(certSearch.toLowerCase())
  );

  const toggleCert = (cert: string) => {
    setCertificates(prev =>
      prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]
    );
  };

  const addCustomCert = () => {
    const val = certSearch.trim();
    if (!val || certificates.includes(val)) return;
    setCertificates(prev => [...prev, val]);
    setCertSearch('');
    setCertSheetOpen(false);
  };

  /* ── 제출 ── */
  const handleSubmit = () => {
    onNext({
      schoolName: schoolName.trim(),
      major: major.trim(),
      gpa: parseFloat(gpa),
      languages: languages.filter(l => l.test && l.score),
      certificates,
      targetCompany: targetCompany ?? 'large',
      situation: situation!,
      jobType: jobType!,
      etcJobDesc: jobType === 'etc' ? etcJobDesc.trim() : undefined,
    });
  };

  const anySheetOpen = certSheetOpen || situationOpen || companyOpen || jobTypeOpen || langTestOpenIdx !== null;

  return (
    <div style={s.container}>
      {anySheetOpen && <div style={s.dimmer} />}
      <div style={s.scrollContent}>
        <Top title="스펙 입력" subtitleBottom="기본 정보를 입력해주세요" />

        <ProgressStepper variant="compact" activeStepIndex={0} style={s.stepper}>
          <ProgressStep title="기본 정보" />
          <ProgressStep title="직군 정보" />
        </ProgressStepper>

        {/* 학력 */}
        <ListHeader title="학력" />
        <div style={s.inputWrap} className="always-blue-line">
          <span style={s.inputLabel}>학교명</span>
          <TextField variant="line" value={schoolName}
            onChange={e => setSchoolName(e.target.value)} placeholder="학교명을 입력해주세요" />
        </div>
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
        <SectionGap />

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
              left={<span style={s.rowLabel}>시험 종류</span>}
              right={
                <div style={s.rowRight}>
                  <span style={lang.test ? s.selectedValue : s.placeholderValue}>
                    {lang.test || '선택'}
                  </span>
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

            {/* 점수 + 취득일 */}
            <ListRow left={
              <div style={s.langScoreRow}>
                <TextField variant="line" label="점수" value={lang.score}
                  onChange={e => updateLang(idx, 'score', e.target.value)}
                  placeholder="점수 입력" style={{ flex: 1 }} />
                <div style={s.langDivider} />
                <TextField variant="line" label="취득일" value={lang.date}
                  onChange={e => updateLang(idx, 'date', e.target.value)}
                  placeholder="YYYY.MM" style={{ flex: 1 }} />
              </div>
            } />
          </div>
        ))}
        <ListRow onClick={addLang} left={<span style={s.addBtn}>+ 어학 추가</span>} />
        <SectionGap />

        {/* 자격증 */}
        <ListHeader title="자격증" />
        {certificates.length > 0 && (
          <div style={s.tagWrap}>
            {certificates.map(c => (
              <div key={c} style={s.tag}>
                <span style={s.tagText}>{c}</span>
                <span style={s.tagRemove} onClick={() => toggleCert(c)}>×</span>
              </div>
            ))}
          </div>
        )}
        <ListRow
          onClick={() => { setCertSearch(''); setCertSheetOpen(true); }}
          left={<span style={s.addBtn}>+ 자격증 추가</span>}
        />
        <SectionGap />

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

      <FixedBottomCTA onClick={handleSubmit} disabled={!isValid}>다음</FixedBottomCTA>

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

      {/* 자격증 검색 BottomSheet */}
      <BottomSheet open={certSheetOpen} onDimmerClick={() => setCertSheetOpen(false)}>
        <BottomSheet.Header>자격증 선택</BottomSheet.Header>
        <div style={s.certSearchWrap} className="always-blue-line">
          <TextField
            variant="line"
            label=""
            value={certSearch}
            onChange={e => setCertSearch(e.target.value)}
            placeholder="자격증 검색 또는 직접 입력"
          />
        </div>
        <div style={s.certList}>
          {filteredCerts.length > 0
            ? filteredCerts.map(cert => (
                <ListRow
                  key={cert}
                  onClick={() => toggleCert(cert)}
                  left={<span style={s.rowLabel}>{cert}</span>}
                  right={certificates.includes(cert) ? <span style={s.checkmark}>✓</span> : null}
                />
              ))
            : certSearch.trim() && (
                <div style={s.noResult}>목록에 없어요. 아래에서 직접 추가하세요.</div>
              )
          }
        </div>
        <BottomSheet.CTA onClick={certSearch.trim() && !filteredCerts.includes(certSearch.trim()) ? addCustomCert : () => setCertSheetOpen(false)}>
          {certSearch.trim() && !filteredCerts.includes(certSearch.trim())
            ? `"${certSearch.trim()}" 직접 추가`
            : `확인 (${certificates.length}개 선택됨)`}
        </BottomSheet.CTA>
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
  selectedValue: { fontSize: 14, color: colors.blue500, fontWeight: 500 },
  placeholderValue: { fontSize: 14, color: colors.grey600 },
  checkmark: { fontSize: 16, color: colors.blue500, fontWeight: 700 },
  addBtn: { fontSize: 15, color: colors.blue500, fontWeight: 500 },
  rowRight: { display: 'flex', alignItems: 'center', gap: 6 },
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
  langScoreRow: { display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%' },
  langDivider: { width: 1, height: 32, background: colors.grey100, flexShrink: 0 },
  tagWrap: { display: 'flex', flexWrap: 'wrap' as const, gap: 8, padding: '8px 16px' },
  tag: { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#e8f3ff', borderRadius: 16 },
  tagText: { fontSize: 13, color: colors.blue500, fontWeight: 500 },
  tagRemove: { fontSize: 14, color: colors.blue500, cursor: 'pointer', lineHeight: 1 },
  etcInputWrap: { margin: '8px 16px 16px', padding: '8px 12px 4px', border: `1px solid ${colors.grey100}`, borderRadius: 8 },
  certSearchWrap: { padding: '0 16px 8px' },
  certList: { maxHeight: 320, overflowY: 'auto' as const },
  noResult: { padding: '16px 24px', fontSize: 14, color: colors.grey600, textAlign: 'center' as const },
};
