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
import { CommonSpec, JobSpec, DevJobSpec, BizJobSpec, FinanceJobSpec, PublicInfo, EtcJobSpec, CareerLevel, ProjectEntry, CodingTestLevel, OfficeSkillLevel, MajorType, EtcSubCategory } from '../types/spec';
import { DEV_CERTIFICATES, BIZ_CERTIFICATES, FINANCE_CERTIFICATES, PUBLIC_CERTIFICATES, ETC_CERTIFICATES, BIZ_ROLES } from '../constants/jobTypes';

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
const CODING_TEST_LEVELS: { label: string; value: CodingTestLevel }[] = [
  { label: '없음', value: 'none' },
  { label: '기초', value: 'basic' },
  { label: '중급', value: 'intermediate' },
  { label: '고급', value: 'advanced' },
];

function DevForm({ onSubmit, isPublicCompany }: { onSubmit: (spec: DevJobSpec) => void; isPublicCompany?: boolean }) {
  const [careerLevel, setCareerLevel] = useState<CareerLevel | null>(null);
  const [codingTest, setCodingTest] = useState<CodingTestLevel | null>(null);
  const [githubActive, setGithubActive] = useState<boolean | null>(null);
  const [internMonths, setInternMonths] = useState('');
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const keyCounter = useRef(1);
  const [projectKeys, setProjectKeys] = useState<number[]>([0]);
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

  const addProject = () => {
    setProjectKeys(prev => [...prev, keyCounter.current++]);
    setProjects(prev => [...prev, { name: '', github: '', desc: '' }]);
  };
  const removeProject = (i: number) => {
    setProjectKeys(prev => prev.filter((_, idx) => idx !== i));
    setProjects(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!careerLevel) missing.push('경력');
    if (codingTest === null) missing.push('코딩테스트 준비');
    if (githubActive === null) missing.push('GitHub 활동');
    if (techStack.length === 0) missing.push('기술 스택 · 도구');
    return missing;
  };

  const handleSubmit = () => {
    if (getMissingFields().length > 0) { setValidationOpen(true); return; }
    onSubmit({
      careerLevel: careerLevel!,
      codingTest: codingTest!,
      githubActive: githubActive!,
      internMonths: parseInt(internMonths || '0', 10),
      techStack,
      projects: projects.filter(p => p.name.trim()),
      notes,
      certificates,
    });
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

      <ListHeader title="코딩테스트 준비" />
      <div style={s.toggleRow}>
        {CODING_TEST_LEVELS.map(lv => (
          <button key={lv.value}
            style={{ ...s.toggleBtn, ...(codingTest === lv.value ? s.toggleBtnActive : {}) }}
            onClick={() => setCodingTest(lv.value)}>
            {lv.label}
          </button>
        ))}
      </div>

      <ListHeader title="GitHub 꾸준한 활동" />
      <div style={s.toggleRow}>
        <button style={{ ...s.toggleBtn, ...(githubActive === true ? s.toggleBtnActive : {}) }}
          onClick={() => setGithubActive(true)}>예, 활동 중</button>
        <button style={{ ...s.toggleBtn, ...(githubActive === false ? s.toggleBtnActive : {}) }}
          onClick={() => setGithubActive(false)}>거의 없음</button>
      </div>

      <ListHeader title="인턴·현장실습 경험 (선택)" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>경험 기간 (개월, 없으면 0)</span>
        <TextField variant="line" value={internMonths}
          onChange={e => setInternMonths(e.target.value)} inputMode="numeric" placeholder="예) 6" />
      </div>

      <ListHeader title="기술 스택 · 도구" />
      <div style={s.inputWrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <TextField variant="line" value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTech()}
              placeholder="예) React, Java, AWS, Docker" />
          </div>
          <button style={s.techAddBtn} onClick={addTech}>추가</button>
        </div>
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
        <div key={projectKeys[i]} style={s.projectCard}>
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
            {p.readmeStatus === 'done' && <span style={{ ...s.readmeBadge, color: colors.green500 }}>✓ README 자동 읽음 — 아래 설명 생략 가능</span>}
            {p.readmeStatus === 'error' && <span style={{ ...s.readmeBadge, color: colors.orange500 }}>⚠ README 없음 — 아래에 직접 입력해주세요</span>}
            {p.readmeStatus === 'private' && <span style={{ ...s.readmeBadge, color: colors.orange500 }}>⚠ 비공개 레포 — 아래에 직접 입력해주세요</span>}
          </div>
          <div style={{
            ...s.inputWrap,
            ...((['error', 'private'].includes(p.readmeStatus ?? ''))
              ? { border: `1px solid ${colors.orange500}` }
              : {}),
          }}>
            <AutoTextarea
              label={
                p.readmeStatus === 'done'
                  ? '역할 · 구현 내용 (선택 — README로 대체됨)'
                  : '역할 · 구현 내용 (직접 입력)'
              }
              value={p.desc}
              onChange={v => updateProject(i, 'desc', v)}
              rows={3}
              placeholder={
                p.readmeStatus === 'done'
                  ? 'README에 없는 추가 내용이 있으면 적어주세요'
                  : '맡은 역할, 기술 스택, 주요 구현 내용을 적어주세요'
              }
            />
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
        <button style={s.nextBtn} onClick={handleSubmit}>{isPublicCompany ? '다음 (공기업 정보)' : '분석 시작하기'}</button>
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

const OFFICE_SKILL_LEVELS: { label: string; value: OfficeSkillLevel }[] = [
  { label: '기초', value: 'none' },
  { label: '중급', value: 'basic' },
  { label: '고급', value: 'intermediate' },
  { label: 'VBA 가능', value: 'advanced' },
];

/* ──────────── Biz Form ──────────── */
function BizForm({ onSubmit, isPublicCompany }: { onSubmit: (spec: BizJobSpec) => void; isPublicCompany?: boolean }) {
  const [bizRole, setBizRole] = useState('');
  const [bizRoleSheetOpen, setBizRoleSheetOpen] = useState(false);
  const [officeSkill, setOfficeSkill] = useState<OfficeSkillLevel | null>(null);
  const [internMonths, setInternMonths] = useState('');
  const [contestAwards, setContestAwards] = useState('');
  const [certificates, setCertificates] = useState<string[]>([]);
  const [validationOpen, setValidationOpen] = useState(false);

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!bizRole) missing.push('희망 직무');
    if (officeSkill === null) missing.push('오피스 스킬');
    return missing;
  };

  const handleSubmit = () => {
    if (getMissingFields().length > 0) { setValidationOpen(true); return; }
    onSubmit({
      bizRole,
      officeSkill: officeSkill!,
      internMonths: parseInt(internMonths || '0', 10),
      contestAwards: parseInt(contestAwards || '0', 10),
      certificates,
    });
  };

  return (
    <>
      <ListHeader title="희망 직무" />
      <ListRow
        onClick={() => setBizRoleSheetOpen(true)}
        left={<span style={bizRole ? s.selectedValue : s.rowLabel}>{bizRole || '직무 선택'}</span>}
        right={<div style={s.rowRight}><span style={s.placeholderValue}>선택</span><ChevronRight /></div>}
      />

      <ListHeader title="오피스 스킬 (엑셀)" />
      <div style={s.toggleRow}>
        {OFFICE_SKILL_LEVELS.map(lv => (
          <button key={lv.value}
            style={{ ...s.toggleBtn, ...(officeSkill === lv.value ? s.toggleBtnActive : {}) }}
            onClick={() => setOfficeSkill(lv.value)}>
            {lv.label}
          </button>
        ))}
      </div>

      <ListHeader title="인턴 경험 (선택)" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>인턴 기간 (개월, 없으면 0)</span>
        <TextField variant="line" value={internMonths}
          onChange={e => setInternMonths(e.target.value)} inputMode="numeric" placeholder="예) 6" />
      </div>

      <ListHeader title="공모전·대외활동 (선택)" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>수상 횟수</span>
        <TextField variant="line" value={contestAwards}
          onChange={e => setContestAwards(e.target.value)} inputMode="numeric" placeholder="예) 2" />
      </div>

      <CertSection
        certificates={certificates}
        certList={BIZ_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={handleSubmit}>{isPublicCompany ? '다음 (공기업 정보)' : '분석 시작하기'}</button>
      </div>

      <BottomSheet open={bizRoleSheetOpen} onDimmerClick={() => setBizRoleSheetOpen(false)}>
        <BottomSheet.Header>희망 직무 선택</BottomSheet.Header>
        {BIZ_ROLES.map(r => (
          <ListRow key={r.value}
            onClick={() => { setBizRole(r.value); setBizRoleSheetOpen(false); }}
            left={<span style={s.rowLabel}>{r.label}</span>}
            right={bizRole === r.value ? <span style={s.checkmark}>✓</span> : null} />
        ))}
      </BottomSheet>

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

/* ──────────── Finance Form ──────────── */
function FinanceForm({ onSubmit, isPublicCompany }: { onSubmit: (spec: FinanceJobSpec) => void; isPublicCompany?: boolean }) {
  const [certificates, setCertificates] = useState<string[]>([]);
  const [hasFinanceIntern, setHasFinanceIntern] = useState<boolean | null>(null);
  const [financeContest, setFinanceContest] = useState<boolean | null>(null);
  const [financeClub, setFinanceClub] = useState<boolean | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);

  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (hasFinanceIntern === null) missing.push('금융권 인턴 경험');
    if (financeContest === null) missing.push('금융 공모전·리포트 경험');
    if (financeClub === null) missing.push('금융 학회·동아리');
    return missing;
  };

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
        <button style={{ ...s.toggleBtn, ...(hasFinanceIntern === true ? s.toggleBtnActive : {}) }}
          onClick={() => setHasFinanceIntern(true)}>경험 있음</button>
        <button style={{ ...s.toggleBtn, ...(hasFinanceIntern === false ? s.toggleBtnActive : {}) }}
          onClick={() => setHasFinanceIntern(false)}>경험 없음</button>
      </div>

      <ListHeader title="금융 공모전·리포트 경험" />
      <div style={s.toggleRow}>
        <button style={{ ...s.toggleBtn, ...(financeContest === true ? s.toggleBtnActive : {}) }}
          onClick={() => setFinanceContest(true)}>있음</button>
        <button style={{ ...s.toggleBtn, ...(financeContest === false ? s.toggleBtnActive : {}) }}
          onClick={() => setFinanceContest(false)}>없음</button>
      </div>

      <ListHeader title="금융 학회·동아리 활동" />
      <div style={s.toggleRow}>
        <button style={{ ...s.toggleBtn, ...(financeClub === true ? s.toggleBtnActive : {}) }}
          onClick={() => setFinanceClub(true)}>활동 있음</button>
        <button style={{ ...s.toggleBtn, ...(financeClub === false ? s.toggleBtnActive : {}) }}
          onClick={() => setFinanceClub(false)}>없음</button>
      </div>

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={() => {
          if (getMissingFields().length > 0) { setValidationOpen(true); return; }
          onSubmit({ certificates, hasFinanceIntern: hasFinanceIntern!, financeContest: financeContest!, financeClub: financeClub! });
        }}>{isPublicCompany ? '다음 (공기업 정보)' : '분석 시작하기'}</button>
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

const MAJOR_TYPES: { label: string; value: MajorType }[] = [
  { label: '이공계', value: 'engineering' },
  { label: '상경계', value: 'business' },
  { label: '인문계', value: 'humanities' },
  { label: '기타', value: 'other' },
];

/* ──────────── Public Form ──────────── */
function PublicForm({ onSubmit }: { onSubmit: (spec: PublicInfo) => void }) {
  const [ncsLevel, setNcsLevel] = useState<'none' | 'basic' | 'intermediate' | 'advanced' | null>(null);
  const [koreanHistoryLevel, setKoreanHistoryLevel] = useState('');
  const [targetPublicType, setTargetPublicType] = useState('');
  const [majorType, setMajorType] = useState<MajorType | null>(null);
  const [volunteerHours, setVolunteerHours] = useState('');
  const [publicIntern, setPublicIntern] = useState<boolean | null>(null);
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
    if (majorType === null) missing.push('전공 계열');
    if (publicIntern === null) missing.push('공공기관 인턴');
    return missing;
  };

  return (
    <>
      <ListHeader title="NCS 준비 수준" />
      <div style={s.toggleRow}>
        {NCS_LEVELS.map(n => (
          <button key={n.value}
            style={{ ...s.toggleBtn, ...(ncsLevel === n.value ? s.toggleBtnActive : {}) }}
            onClick={() => setNcsLevel(n.value)}>
            {n.label}
          </button>
        ))}
      </div>

      <ListHeader title="전공 계열" />
      <div style={s.toggleRow}>
        {MAJOR_TYPES.map(m => (
          <button key={m.value}
            style={{ ...s.toggleBtn, ...(majorType === m.value ? s.toggleBtnActive : {}) }}
            onClick={() => setMajorType(m.value)}>
            {m.label}
          </button>
        ))}
      </div>

      <ListHeader title="한국사능력검정 (선택)" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>취득 급수 (없으면 0)</span>
        <TextField variant="line" value={koreanHistoryLevel}
          onChange={e => setKoreanHistoryLevel(e.target.value)} inputMode="numeric" placeholder="예) 1 (1~6급)" />
      </div>

      <ListHeader title="봉사활동 경험 (선택)" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>봉사 시간 (없으면 0)</span>
        <TextField variant="line" value={volunteerHours}
          onChange={e => setVolunteerHours(e.target.value)} inputMode="numeric" placeholder="예) 40" />
      </div>

      <ListHeader title="공공기관 인턴 경험" />
      <div style={s.toggleRow}>
        <button style={{ ...s.toggleBtn, ...(publicIntern === true ? s.toggleBtnActive : {}) }}
          onClick={() => setPublicIntern(true)}>경험 있음</button>
        <button style={{ ...s.toggleBtn, ...(publicIntern === false ? s.toggleBtnActive : {}) }}
          onClick={() => setPublicIntern(false)}>경험 없음</button>
      </div>

      <ListHeader title="목표 공기업" />
      <div style={s.inputWrap}>
        <span style={s.fieldLabel}>목표 기관</span>
        <TextField variant="line" value={targetPublicType}
          onChange={e => setTargetPublicType(e.target.value)} placeholder="예) 한국전력공사, 코레일" />
      </div>

      <CertSection
        certificates={certificates}
        certList={PUBLIC_CERTIFICATES}
        onToggle={toggleCert}
        onAddCustom={addCustomCert}
      />

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={() => {
          if (getMissingFields().length > 0) { setValidationOpen(true); return; }
          onSubmit({
            ncsLevel: ncsLevel!,
            koreanHistoryLevel: parseInt(koreanHistoryLevel || '0', 10),
            targetPublicType,
            majorType: majorType!,
            volunteerHours: parseInt(volunteerHours || '0', 10),
            publicIntern: publicIntern!,
            certificates,
          });
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

const ETC_SUB_CATEGORIES: { label: string; value: EtcSubCategory }[] = [
  { label: '서비스업', value: 'service' },
  { label: '의료·보건', value: 'medical' },
  { label: '유통·물류', value: 'logistics' },
  { label: '교육', value: 'education' },
  { label: '기타', value: 'other' },
];

/* ──────────── Etc Form ──────────── */
function EtcForm({ commonSpec, onSubmit, isPublicCompany }: { commonSpec: CommonSpec; onSubmit: (spec: EtcJobSpec) => void; isPublicCompany?: boolean }) {
  const [etcSubCategory, setEtcSubCategory] = useState<EtcSubCategory | null>(null);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [validationOpen, setValidationOpen] = useState(false);

  // 서비스업
  const [speakingGrade, setSpeakingGrade] = useState('');
  const [serviceMonths, setServiceMonths] = useState('');
  // 의료·보건
  const [hasNationalLicense, setHasNationalLicense] = useState<boolean | null>(null);
  const [hospitalMonths, setHospitalMonths] = useState('');
  // 유통·물류
  const [logisticsMonths, setLogisticsMonths] = useState('');
  // 교육
  const [hasTeacherLicense, setHasTeacherLicense] = useState<boolean | null>(null);
  const [teachingMonths, setTeachingMonths] = useState('');

  const toggleCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert]);
  const addCustomCert = (cert: string) =>
    setCertificates(prev => prev.includes(cert) ? prev : [...prev, cert]);

  const certList = etcSubCategory ? (ETC_CERTIFICATES[etcSubCategory] ?? []) : [];

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!etcSubCategory) missing.push('세부 분야');
    if (!experience.trim()) missing.push('관련 경험');
    if (etcSubCategory === 'medical' && hasNationalLicense === null) missing.push('국가면허 보유 여부');
    return missing;
  };

  const handleSubmit = () => {
    if (getMissingFields().length > 0) { setValidationOpen(true); return; }
    const base: EtcJobSpec = {
      jobDesc: commonSpec.etcJobDesc ?? '',
      etcSubCategory: etcSubCategory!,
      certificates,
      experience,
    };
    if (etcSubCategory === 'service') {
      base.speakingGrade = speakingGrade;
      base.serviceMonths = parseInt(serviceMonths || '0', 10);
    } else if (etcSubCategory === 'medical') {
      base.hasNationalLicense = hasNationalLicense!;
      base.hospitalMonths = parseInt(hospitalMonths || '0', 10);
    } else if (etcSubCategory === 'logistics') {
      base.logisticsMonths = parseInt(logisticsMonths || '0', 10);
    } else if (etcSubCategory === 'education') {
      base.hasTeacherLicense = hasTeacherLicense ?? false;
      base.teachingMonths = parseInt(teachingMonths || '0', 10);
    }
    onSubmit(base);
  };

  return (
    <>
      <ListHeader title="세부 분야 선택" />
      <div style={s.toggleRow}>
        {ETC_SUB_CATEGORIES.map(c => (
          <button key={c.value}
            style={{ ...s.toggleBtn, ...(etcSubCategory === c.value ? s.toggleBtnActive : {}) }}
            onClick={() => { setEtcSubCategory(c.value); setCertificates([]); }}>
            {c.label}
          </button>
        ))}
      </div>

      {etcSubCategory === 'service' && (
        <>
          <ListHeader title="어학 스피킹 등급 (선택)" />
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>오픽/토스 등급</span>
            <TextField variant="line" value={speakingGrade}
              onChange={e => setSpeakingGrade(e.target.value)} placeholder="예) 오픽 IH, 토스 Level 6" />
          </div>
          <ListHeader title="서비스업 경험 (선택)" />
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>경험 기간 (개월, 없으면 0)</span>
            <TextField variant="line" value={serviceMonths}
              onChange={e => setServiceMonths(e.target.value)} inputMode="numeric" placeholder="예) 12" />
          </div>
        </>
      )}

      {etcSubCategory === 'medical' && (
        <>
          <ListHeader title="국가면허 보유 여부" />
          <div style={s.toggleRow}>
            <button style={{ ...s.toggleBtn, ...(hasNationalLicense === true ? s.toggleBtnActive : {}) }}
              onClick={() => setHasNationalLicense(true)}>보유</button>
            <button style={{ ...s.toggleBtn, ...(hasNationalLicense === false ? s.toggleBtnActive : {}) }}
              onClick={() => setHasNationalLicense(false)}>미보유 (준비 중)</button>
          </div>
          <ListHeader title="병원·임상 실습 경험 (선택)" />
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>실습 기간 (개월, 없으면 0)</span>
            <TextField variant="line" value={hospitalMonths}
              onChange={e => setHospitalMonths(e.target.value)} inputMode="numeric" placeholder="예) 6" />
          </div>
        </>
      )}

      {etcSubCategory === 'logistics' && (
        <>
          <ListHeader title="현장·인턴 경험 (선택)" />
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>경험 기간 (개월, 없으면 0)</span>
            <TextField variant="line" value={logisticsMonths}
              onChange={e => setLogisticsMonths(e.target.value)} inputMode="numeric" placeholder="예) 6" />
          </div>
        </>
      )}

      {etcSubCategory === 'education' && (
        <>
          <ListHeader title="교원자격증 보유 여부 (선택)" />
          <div style={s.toggleRow}>
            <button style={{ ...s.toggleBtn, ...(hasTeacherLicense === true ? s.toggleBtnActive : {}) }}
              onClick={() => setHasTeacherLicense(true)}>보유</button>
            <button style={{ ...s.toggleBtn, ...(hasTeacherLicense === false ? s.toggleBtnActive : {}) }}
              onClick={() => setHasTeacherLicense(false)}>없음</button>
          </div>
          <ListHeader title="강사 경험 (선택)" />
          <div style={s.inputWrap}>
            <span style={s.fieldLabel}>경험 기간 (개월, 없으면 0)</span>
            <TextField variant="line" value={teachingMonths}
              onChange={e => setTeachingMonths(e.target.value)} inputMode="numeric" placeholder="예) 12" />
          </div>
        </>
      )}

      {certList.length > 0 && (
        <CertSection
          certificates={certificates}
          certList={certList}
          onToggle={toggleCert}
          onAddCustom={addCustomCert}
        />
      )}

      <ListHeader title="경력·경험" />
      <div style={s.inputWrap}>
        <AutoTextarea label="관련 경험 요약" value={experience} onChange={setExperience}
          rows={5} placeholder="관련 경험이나 준비 사항을 입력해주세요" />
      </div>

      <div style={s.bottomBar}>
        <button style={s.nextBtn} onClick={handleSubmit}>{isPublicCompany ? '다음 (공기업 정보)' : '분석 시작하기'}</button>
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

/* ──────────── Main JobForm ──────────── */
export default function JobForm({ commonSpec, onNext, onBack }: Props) {
  const [pendingJobSpec, setPendingJobSpec] = useState<JobSpec | null>(null);
  const [showPublicStep, setShowPublicStep] = useState(false);

  const jobInfo = JOB_TYPE_LABELS[commonSpec.jobType] ?? { label: '기타', emoji: '✨' };
  const isPublicCompany = commonSpec.targetCompany === 'public';

  const handleJobSubmit = (jobSpec: JobSpec) => {
    if (isPublicCompany) {
      setPendingJobSpec(jobSpec);
      setShowPublicStep(true);
    } else {
      onNext(commonSpec, jobSpec);
    }
  };

  const handlePublicSubmit = (publicInfo: PublicInfo) => {
    onNext(commonSpec, { ...pendingJobSpec!, publicInfo });
  };

  return (
    <div style={s.container}>
      <div style={s.scrollContent}>
        <div style={s.backBar}>
          <button style={s.backBtn} onClick={showPublicStep ? () => setShowPublicStep(false) : onBack}>
            <BackIcon />
          </button>
        </div>

        {!showPublicStep ? (
          <>
            <Top
              subtitleTop={<span style={{ color: colors.blue500, fontSize: 13, fontWeight: 600 }}>STEP 2</span>}
              title="직군 정보 입력"
              subtitleBottom={<span style={{ color: colors.grey600 }}>직무 관련 정보를 입력해주세요</span>}
            />

            <ProgressStepper variant="compact" activeStepIndex={1} style={s.stepper}>
              <ProgressStep title="기본 정보" />
              <ProgressStep title="직군 정보" />
              {isPublicCompany && <ProgressStep title="공기업 정보" />}
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

            {commonSpec.jobType === 'dev' && <DevForm onSubmit={handleJobSubmit} isPublicCompany={isPublicCompany} />}
            {commonSpec.jobType === 'biz' && <BizForm onSubmit={handleJobSubmit} isPublicCompany={isPublicCompany} />}
            {commonSpec.jobType === 'finance' && <FinanceForm onSubmit={handleJobSubmit} isPublicCompany={isPublicCompany} />}
            {commonSpec.jobType === 'etc' && <EtcForm commonSpec={commonSpec} onSubmit={handleJobSubmit} isPublicCompany={isPublicCompany} />}
          </>
        ) : (
          <>
            <Top
              subtitleTop={<span style={{ color: colors.blue500, fontSize: 13, fontWeight: 600 }}>STEP 3</span>}
              title="공기업 정보 입력"
              subtitleBottom={<span style={{ color: colors.grey600 }}>공기업 지원에 필요한 정보를 입력해주세요</span>}
            />

            <ProgressStepper variant="compact" activeStepIndex={2} style={s.stepper}>
              <ProgressStep title="기본 정보" />
              <ProgressStep title="직군 정보" />
              <ProgressStep title="공기업 정보" />
            </ProgressStepper>

            <Border />
            <PublicForm onSubmit={handlePublicSubmit} />
          </>
        )}
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
  techAddBtn: {
    height: 32,
    padding: '0 14px',
    borderRadius: 16,
    background: colors.blue500,
    color: '#fff',
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  },
  certSearchWrap: { padding: '0 16px 8px' },
  certList: { maxHeight: 220, overflowY: 'auto' as const, paddingBottom: 8 },
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
