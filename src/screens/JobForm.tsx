import React, { useState, useRef } from 'react';
import {
  Top,
  ListHeader,
  ListRow,
  Border,
  BottomSheet,
  TextField,
  ProgressStepper,
  ProgressStep,
} from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { CommonSpec, JobSpec, DevJobSpec, BizJobSpec, FinanceJobSpec, PublicJobSpec, EtcJobSpec, CareerLevel, ProjectEntry } from '../types/spec';
import { DEV_CERTIFICATES, BIZ_CERTIFICATES, FINANCE_CERTIFICATES, PUBLIC_CERTIFICATES } from '../constants/jobTypes';

const ChevronRight = () => (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
    <path d="M1 1L7 7L1 13" stroke="#b0b8c1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
    <path d="M9 1L1 9L9 17" stroke={colors.grey900} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Props {
  commonSpec: CommonSpec;
  onNext: (commonSpec: CommonSpec, jobSpec: JobSpec) => void;
  onBack: () => void;
}

const JOB_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  dev: { label: '개발 (Development)', emoji: '💻' },
  biz: { label: '경영·사무', emoji: '📋' },
  finance: { label: '금융·회계', emoji: '💰' },
  public: { label: '공기업', emoji: '🏛️' },
  etc: { label: '기타', emoji: '✨' },
};

const CAREER_LEVELS: { label: string; value: CareerLevel }[] = [
  { label: '신입', value: 'entry' },
  { label: '1년 미만', value: 'under1' },
  { label: '1~3년', value: '1to3' },
  { label: '3~5년', value: '3to5' },
  { label: '5년 이상', value: '5plus' },
];

const NCS_LEVELS = [
  { label: '없음', value: 'none' as const },
  { label: '기초', value: 'basic' as const },
  { label: '중급', value: 'intermediate' as const },
  { label: '고급', value: 'advanced' as const },
];

function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

async function fetchReadme(owner: string, repo: string): Promise<string | 'private' | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });
    if (res.status === 404) return null;
    if (res.status === 403) return 'private';
    const data = await res.json();
    const decoded = atob(data.content.replace(/\n/g, ''));
    return decoded.slice(0, 4000);
  } catch {
    return null;
  }
}

/* ── 자동 높이 조절 Textarea ── */
function AutoTextarea({
  label, value, onChange, placeholder, rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  return (
    <div style={{ width: '100%', paddingBottom: 8 }}>
      {label && <span style={s.fieldLabel}>{label}</span>}
      <textarea
        ref={ref}
        value={value}
        rows={rows}
        onChange={e => { onChange(e.target.value); autoResize(); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%',
          resize: 'none',
          border: 'none',
          borderBottom: `1.5px solid ${focused ? colors.blue500 : colors.grey200}`,
          outline: 'none',
          fontSize: 16,
          color: colors.grey900,
          background: 'transparent',
          lineHeight: 1.6,
          padding: '6px 0',
          boxSizing: 'border-box' as const,
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

/* ── 자격증 선택 UI (공용) ── */
interface CertSectionProps {
  certificates: string[];
  certList: string[];
  onToggle: (cert: string) => void;
  onAddCustom: (cert: string) => void;
}

function CertSection({ certificates, certList, onToggle, onAddCustom }: CertSectionProps) {
  const [certSheetOpen, setCertSheetOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');

  const filtered = certList.filter(c => c.toLowerCase().includes(certSearch.toLowerCase()));

  const handleCTA = () => {
    const val = certSearch.trim();
    if (val && !filtered.includes(val)) {
      onAddCustom(val);
      setCertSearch('');
      setCertSheetOpen(false);
    } else {
      setCertSheetOpen(false);
    }
  };

  return (
    <>
      <ListHeader title="보유 자격증 (선택)" />
      {certificates.length > 0 && (
        <div style={s.tagRow}>
          {certificates.map(c => (
            <div key={c} style={s.tag}>
              <span style={s.tagText}>{c}</span>
              <span style={s.tagRemove} onClick={() => onToggle(c)}>×</span>
            </div>
          ))}
        </div>
      )}
      <ListRow
        onClick={() => { setCertSearch(''); setCertSheetOpen(true); }}
        left={<span style={s.addBtn}>+ 자격증 추가</span>}
      />
      <BottomSheet open={certSheetOpen} onDimmerClick={() => setCertSheetOpen(false)}>
        <BottomSheet.Header>자격증 선택</BottomSheet.Header>
        <div style={s.certSearchWrap}>
          <TextField variant="line" label="" value={certSearch}
            onChange={e => setCertSearch(e.target.value)}
            placeholder="자격증 검색 또는 직접 입력" />
        </div>
        <div style={s.certList}>
          {filtered.length > 0
            ? filtered.map(cert => (
                <ListRow key={cert} onClick={() => onToggle(cert)}
                  left={<span style={s.rowLabel}>{cert}</span>}
                  right={certificates.includes(cert) ? <span style={s.checkmark}>✓</span> : null} />
              ))
            : certSearch.trim() && (
                <div style={s.noResult}>목록에 없어요. 아래에서 직접 추가하세요.</div>
              )
          }
        </div>
        <BottomSheet.CTA onClick={handleCTA}>
          {certSearch.trim() && !filtered.includes(certSearch.trim())
            ? `"${certSearch.trim()}" 직접 추가`
            : `확인 (${certificates.length}개 선택됨)`}
        </BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Dev Form ──────────── */
function DevForm({ onSubmit }: { onSubmit: (spec: DevJobSpec) => void }) {
  const [careerLevel, setCareerLevel] = useState<CareerLevel | null>(null);
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectEntry[]>([{ name: '', github: '', desc: '' }]);
  const [notes, setNotes] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]);
  const [careerSheetOpen, setCareerSheetOpen] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);

  const addTech = () => {
    const val = techInput.trim();
    if (!val || techStack.includes(val)) return;
    setTechStack(prev => [...prev, val]);
    setTechInput('');
  };

  const removeTech = (t: string) => setTechStack(prev => prev.filter(s => s !== t));

  const updateProject = (i: number, field: keyof ProjectEntry, val: string) =>
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const handleGithubBlur = async (i: number, url: string) => {
    const parsed = parseGithubUrl(url);
    if (!parsed) return;
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, readmeStatus: 'loading' } : p));
    const result = await fetchReadme(parsed.owner, parsed.repo);
    setProjects(prev => prev.map((p, idx) => {
      if (idx !== i) return p;
      if (result === 'private') return { ...p, readmeStatus: 'private', readme: undefined };
      if (!result) return { ...p, readmeStatus: 'error', readme: undefined };
      return { ...p, readmeStatus: 'done', readme: result };
    }));
  };

  const addProject = () => setProjects(prev => [...prev, { name: '', github: '', desc: '' }]);
  const removeProject = (i: number) => setProjects(prev => prev.filter((_, idx) => idx !== i));

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!careerLevel) missing.push('경력');
    if (techStack.length === 0) missing.push('기술 스택 · 도구');
    return missing;
  };

  const handleSubmit = () => {
    if (getMissingFields().length > 0) { setValidationOpen(true); return; }
    onSubmit({ careerLevel: careerLevel!, techStack, projects: projects.filter(p => p.name.trim()), notes, certificates });
  };

  return (
    <>
      <ListHeader title="경력" />
      <ListRow
        onClick={() => setCareerSheetOpen(true)}
        left={
          <span style={careerLevel ? s.selectedValue : s.rowLabel}>
            {careerLevel ? CAREER_LEVELS.find(c => c.value === careerLevel)?.label : '경력 선택'}
          </span>
        }
        right={
          <div style={s.rowRight}>
            <span style={s.placeholderValue}>선택</span>
            <ChevronRight />
          </div>
        }
      />

      <ListHeader title="기술 스택 · 도구" />
      <div style={s.inputWrap}>
        <TextField variant="line" value={techInput}
          onChange={e => setTechInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTech()}
          placeholder="예) React, Java, AWS, Docker" />
      </div>
      {techStack.length > 0 && (
        <div style={s.tagRow}>
          {techStack.map(t => (
            <div key={t} style={s.tag}>
              <span style={s.tagText}>{t}</span>
              <span style={s.tagRemove} onClick={() => removeTech(t)}>×</span>
            </div>
          ))}
        </div>
      )}

      <ListHeader title="프로젝트 경험 (선택)" />
      {projects.map((p, i) => (
        <div key={i} style={s.projectCard}>
          <div style={s.projectCardHeader}>
            <span style={s.projectTitle}>프로젝트 {i + 1}</span>
            {projects.length > 1 && (
              <button style={s.projectDeleteBtn} onClick={() => removeProject(i)}>삭제</button>
            )}
          </div>
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>프로젝트명</span>
            <TextField variant="line" value={p.name}
              onChange={e => updateProject(i, 'name', e.target.value)}
              placeholder="프로젝트 이름을 입력해주세요" />
          </div>
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>GitHub 링크 (선택)</span>
            <TextField variant="line" value={p.github}
              onChange={e => updateProject(i, 'github', e.target.value)}
              onBlur={e => handleGithubBlur(i, e.target.value)}
              placeholder="https://github.com/..." />
            {p.readmeStatus === 'loading' && <span style={s.readmeBadge}>README 읽는 중...</span>}
            {p.readmeStatus === 'done' && <span style={{ ...s.readmeBadge, color: colors.green500 }}>✓ README 읽음</span>}
            {p.readmeStatus === 'error' && <span style={{ ...s.readmeBadge, color: colors.grey600 }}>README 없음</span>}
            {p.readmeStatus === 'private' && <span style={{ ...s.readmeBadge, color: colors.orange500 }}>비공개 레포</span>}
          </div>
          <div style={s.inputWrap}>
            <AutoTextarea label="역할 · 구현 내용 (선택)" value={p.desc}
              onChange={v => updateProject(i, 'desc', v)} rows={3}
              placeholder="맡은 역할이나 구현한 내용을 간결하게 적어주세요" />
          </div>
        </div>
      ))}
      <ListRow onClick={addProject} left={<span style={s.addBtn}>+ 프로젝트 추가</span>} />

      <CertSection
        certificates={certificates}
        certList={DEV_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <ListHeader title="기타 사항 (선택)" />
      <div style={s.inputWrap}>
        <AutoTextarea value={notes} onChange={setNotes} rows={3}
          placeholder="추가로 입력할 내용이 있다면 적어주세요" />
      </div>

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={handleSubmit}>분석 시작하기</button>
      </div>

      <BottomSheet open={careerSheetOpen} onDimmerClick={() => setCareerSheetOpen(false)}>
        <BottomSheet.Header>경력 선택</BottomSheet.Header>
        {CAREER_LEVELS.map(c => (
          <ListRow key={c.value}
            onClick={() => { setCareerLevel(c.value); setCareerSheetOpen(false); }}
            left={<span style={s.rowLabel}>{c.label}</span>}
            right={careerLevel === c.value ? <span style={s.checkmark}>✓</span> : null} />
        ))}
      </BottomSheet>

      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          {getMissingFields().map(f => (
            <div key={f} style={s.missingItem}>
              <span style={s.missingDot}>•</span>
              <span style={s.missingText}>{f}</span>
            </div>
          ))}
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Biz Form ──────────── */
function BizForm({ onSubmit }: { onSubmit: (spec: BizJobSpec) => void }) {
  const [internMonths, setInternMonths] = useState('');
  const [contestAwards, setContestAwards] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const handleSubmit = () => {
    onSubmit({
      internMonths: parseInt(internMonths || '0', 10),
      contestAwards: parseInt(contestAwards || '0', 10),
      certificates,
    });
  };

  return (
    <>
      <ListHeader title="인턴 경험" />
      <ListRow left={
        <TextField variant="line" label="인턴 기간 (개월)" value={internMonths}
          onChange={e => setInternMonths(e.target.value)} inputMode="numeric" placeholder="예) 6" />
      } />
      <ListHeader title="공모전·대외활동" />
      <ListRow left={
        <TextField variant="line" label="수상 횟수" value={contestAwards}
          onChange={e => setContestAwards(e.target.value)} inputMode="numeric" placeholder="예) 2" />
      } />

      <CertSection
        certificates={certificates}
        certList={BIZ_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={handleSubmit}>분석 시작하기</button>
      </div>

      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          <div style={s.missingItem}><span style={s.missingDot}>•</span><span style={s.missingText}>입력 항목을 확인해주세요</span></div>
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Finance Form ──────────── */
function FinanceForm({ onSubmit }: { onSubmit: (spec: FinanceJobSpec) => void }) {
  const [certificates, setCertificates] = useState<string[]>([]);
  const [hasFinanceIntern, setHasFinanceIntern] = useState<'yes' | 'no' | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  return (
    <>
      <CertSection
        certificates={certificates}
        certList={FINANCE_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <ListHeader title="금융권 인턴 경험" />
      <div style={s.toggleRow}>
        <button
          style={{ ...s.toggleBtn, ...(hasFinanceIntern === 'yes' ? s.toggleBtnActive : {}) }}
          onClick={() => setHasFinanceIntern('yes')}
        >
          경험 있음
        </button>
        <button
          style={{ ...s.toggleBtn, ...(hasFinanceIntern === 'no' ? s.toggleBtnActive : {}) }}
          onClick={() => setHasFinanceIntern('no')}
        >
          경험 없음
        </button>
      </div>

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={() => {
          if (hasFinanceIntern === null) { setValidationOpen(true); return; }
          onSubmit({ certificates, hasFinanceIntern: hasFinanceIntern === 'yes' });
        }}>분석 시작하기</button>
      </div>

      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          <div style={s.missingItem}><span style={s.missingDot}>•</span><span style={s.missingText}>금융권 인턴 경험 여부</span></div>
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Public Form ──────────── */
function PublicForm({ onSubmit }: { onSubmit: (spec: PublicJobSpec) => void }) {
  const [ncsLevel, setNcsLevel] = useState<'none' | 'basic' | 'intermediate' | 'advanced' | null>(null);
  const [koreanHistoryLevel, setKoreanHistoryLevel] = useState('');
  const [targetPublicType, setTargetPublicType] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (ncsLevel === null) missing.push('NCS 준비 수준');
    if (!targetPublicType.trim()) missing.push('목표 공기업');
    return missing;
  };

  return (
    <>
      <ListHeader title="NCS 준비 수준" />
      <div style={s.toggleRow}>
        {NCS_LEVELS.map(n => (
          <button
            key={n.value}
            style={{ ...s.toggleBtn, ...(ncsLevel === n.value ? s.toggleBtnActive : {}) }}
            onClick={() => setNcsLevel(n.value)}
          >
            {n.label}
          </button>
        ))}
      </div>

      <ListHeader title="한국사능력검정 (선택)" />
      <ListRow left={
        <TextField variant="line" label="취득 급수" value={koreanHistoryLevel}
          onChange={e => setKoreanHistoryLevel(e.target.value)} inputMode="numeric" placeholder="예) 1 (1~6급)" />
      } />

      <ListHeader title="목표 공기업" />
      <ListRow left={
        <TextField variant="line" label="목표 기관" value={targetPublicType}
          onChange={e => setTargetPublicType(e.target.value)} placeholder="예) 한국전력공사, 코레일" />
      } />

      <CertSection
        certificates={certificates}
        certList={PUBLIC_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={() => {
          if (getMissingFields().length > 0) { setValidationOpen(true); return; }
          onSubmit({ ncsLevel: ncsLevel!, koreanHistoryLevel: parseInt(koreanHistoryLevel || '0', 10), targetPublicType, certificates });
        }}>분석 시작하기</button>
      </div>

      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          {getMissingFields().map(f => (
            <div key={f} style={s.missingItem}><span style={s.missingDot}>•</span><span style={s.missingText}>{f}</span></div>
          ))}
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Etc Form ──────────── */
function EtcForm({ commonSpec, onSubmit }: { commonSpec: CommonSpec; onSubmit: (spec: EtcJobSpec) => void }) {
  const [experience, setExperience] = useState('');
  const [validationOpen, setValidationOpen] = useState(false);

  return (
    <>
      <ListHeader title="직군 설명" />
      <ListRow left={<span style={s.rowLabel}>{commonSpec.etcJobDesc || '기타 직군'}</span>} />
      <ListHeader title="경력·경험" />
      <ListRow left={
        <AutoTextarea label="관련 경험" value={experience} onChange={setExperience}
          rows={4} placeholder="관련 경험이나 준비 사항을 입력해주세요" />
      } />
      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={() => {
          if (!experience.trim()) { setValidationOpen(true); return; }
          onSubmit({ jobDesc: commonSpec.etcJobDesc ?? '', experience });
        }}>분석 시작하기</button>
      </div>
      <BottomSheet open={validationOpen} onDimmerClick={() => setValidationOpen(false)}>
        <BottomSheet.Header>입력하지 않은 항목이 있어요</BottomSheet.Header>
        <div style={{ padding: '8px 24px 16px' }}>
          <div style={s.missingItem}><span style={s.missingDot}>•</span><span style={s.missingText}>관련 경험</span></div>
        </div>
        <BottomSheet.CTA onClick={() => setValidationOpen(false)}>확인</BottomSheet.CTA>
      </BottomSheet>
    </>
  );
}

/* ──────────── Main JobForm ──────────── */
export default function JobForm({ commonSpec, onNext, onBack }: Props) {
  const jobInfo = JOB_TYPE_LABELS[commonSpec.jobType] ?? { label: '기타', emoji: '✨' };

  const handleSubmit = (jobSpec: JobSpec) => onNext(commonSpec, jobSpec);

  return (
    <div style={s.container}>
      <div style={s.scrollContent}>
        <div style={s.backBar}>
          <button style={s.backBtn} onClick={onBack}>
            <BackIcon />
          </button>
        </div>
        <Top
          subtitleTop={<span style={{ color: colors.blue500, fontSize: 13, fontWeight: 600 }}>STEP 2</span>}
          title="직군 정보 입력"
          subtitleBottom={<span style={{ color: colors.grey600 }}>직무 관련 정보를 입력해주세요</span>}
        />

        <ProgressStepper variant="compact" activeStepIndex={1} style={s.stepper}>
          <ProgressStep title="기본 정보" />
          <ProgressStep title="직군 정보" />
        </ProgressStepper>

        <ListHeader title="직무 분야" />
        <ListRow
          left={
            <div style={s.jobBadge}>
              <span>{jobInfo.emoji}</span>
              <span style={s.jobBadgeText}>{jobInfo.label}</span>
            </div>
          }
        />
        <Border />

        {commonSpec.jobType === 'dev' && <DevForm onSubmit={handleSubmit} />}
        {commonSpec.jobType === 'biz' && <BizForm onSubmit={handleSubmit} />}
        {commonSpec.jobType === 'finance' && <FinanceForm onSubmit={handleSubmit} />}
        {commonSpec.jobType === 'public' && <PublicForm onSubmit={handleSubmit} />}
        {commonSpec.jobType === 'etc' && <EtcForm commonSpec={commonSpec} onSubmit={handleSubmit} />}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    maxWidth: 375,
    margin: '0 auto',
    minHeight: '100vh',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  backBar: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    padding: '0 8px',
  },
  backBtn: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  stepper: {
    padding: '8px 24px 0',
  },
  rowLabel: {
    fontSize: 16,
    color: colors.grey900,
  },
  selectedValue: {
    fontSize: 16,
    color: colors.blue500,
    fontWeight: 500,
  },
  placeholderValue: {
    fontSize: 14,
    color: colors.grey600,
  },
  checkmark: {
    fontSize: 16,
    color: colors.blue500,
    fontWeight: 700,
  },
  rowRight: { display: 'flex', alignItems: 'center', gap: 6 },
  missingItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' },
  missingDot: { fontSize: 16, color: colors.red500, lineHeight: 1 },
  missingText: { fontSize: 15, color: colors.grey900 },
  jobBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 12px',
    background: '#e8f3ff',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  jobBadgeText: {
    fontSize: 15,
    fontWeight: 600,
    color: colors.blue500,
  },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: colors.grey600, marginBottom: 2 },
  projectTitle: { fontSize: 14, fontWeight: 600, color: colors.grey600 },
  readmeBadge: { display: 'block', fontSize: 12, color: colors.blue500, marginTop: 4 },
  projectDeleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: colors.red500,
    cursor: 'pointer',
    padding: 0,
    fontWeight: 500,
  },
  inputWrap: {
    margin: '4px 16px',
    border: `1px solid ${colors.grey100}`,
    borderRadius: 8,
    padding: '8px 12px 4px',
  },
  projectCard: {
    margin: '8px 16px',
    border: `1px solid ${colors.grey100}`,
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
  },
  projectCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px 4px',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    padding: '8px 16px',
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    background: '#e8f3ff',
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: colors.blue500,
    fontWeight: 500,
  },
  tagRemove: {
    fontSize: 14,
    color: colors.blue500,
    cursor: 'pointer',
    lineHeight: 1,
  },
  addBtn: {
    fontSize: 15,
    color: colors.blue500,
    fontWeight: 500,
  },
  certSearchWrap: { padding: '0 16px 8px' },
  certList: { maxHeight: 320, overflowY: 'auto' as const },
  noResult: { padding: '16px 24px', fontSize: 14, color: colors.grey600, textAlign: 'center' as const },
  toggleRow: {
    display: 'flex',
    gap: 8,
    padding: '8px 16px 12px',
    flexWrap: 'wrap' as const,
  },
  toggleBtn: {
    height: 36,
    padding: '0 20px',
    borderRadius: 18,
    border: `1px solid ${colors.grey200}`,
    background: '#fff',
    fontSize: 14,
    color: colors.grey600,
    cursor: 'pointer',
    fontWeight: 500,
  },
  toggleBtnActive: {
    border: `1px solid ${colors.blue500}`,
    background: '#e8f3ff',
    color: colors.blue500,
  },
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
