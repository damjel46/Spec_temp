import React, { useState } from 'react';
import {
  Top,
  ListHeader,
  ListRow,
  Border,
  SegmentedControl,
  TextField,
  BottomSheet,
  FixedBottomCTA,
  ProgressStepper,
  ProgressStep,
} from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { CommonSpec, JobSpec, DevJobSpec, BizJobSpec, FinanceJobSpec, PublicJobSpec, EtcJobSpec, CareerLevel } from '../types/spec';

interface Props {
  commonSpec: CommonSpec;
  onNext: (commonSpec: CommonSpec, jobSpec: JobSpec) => void;
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

/* ──────────── Dev Form ──────────── */
function DevForm({ onSubmit }: { onSubmit: (spec: DevJobSpec) => void }) {
  const [careerLevel, setCareerLevel] = useState<CareerLevel | null>(null);
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>(['']);
  const [tools, setTools] = useState('');
  const [notes, setNotes] = useState('');
  const [careerSheetOpen, setCareerSheetOpen] = useState(false);

  const addTech = () => {
    const val = techInput.trim();
    if (!val || techStack.length >= 5 || techStack.includes(val)) return;
    setTechStack(prev => [...prev, val]);
    setTechInput('');
  };

  const removeTech = (t: string) => setTechStack(prev => prev.filter(s => s !== t));

  const isValid = careerLevel !== null && techStack.length > 0;

  const handleSubmit = () => {
    if (!careerLevel) return;
    onSubmit({ careerLevel, techStack, projects: projects.filter(Boolean), tools, notes });
  };

  return (
    <>
      <ListHeader title="경력" />
      <ListRow
        onClick={() => setCareerSheetOpen(true)}
        left={<span style={s.rowLabel}>경력 선택</span>}
        right={
          <span style={careerLevel ? s.selectedValue : s.placeholderValue}>
            {careerLevel ? CAREER_LEVELS.find(c => c.value === careerLevel)?.label : '선택'}
          </span>
        }
      />
      <Border />

      <ListHeader title="주요 기술 스택 (최대 5개)" />
      <ListRow
        left={
          <div style={{ width: '100%' }}>
            <div style={s.techInputRow}>
              <TextField
                variant="line"
                label=""
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTech()}
                placeholder="예) Java, Python, React"
                style={{ flex: 1 }}
              />
              <span style={s.counter}>{techStack.length}/5</span>
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
          </div>
        }
      />
      <Border />

      <ListHeader title="프로젝트 경험" />
      {projects.map((p, i) => (
        <ListRow
          key={i}
          left={
            <TextField
              variant="line"
              label={`프로젝트 ${i + 1}`}
              value={p}
              onChange={e => {
                const next = [...projects];
                next[i] = e.target.value;
                setProjects(next);
              }}
              placeholder="프로젝트로 한 내용을 입력해주세요"
            />
          }
        />
      ))}
      <ListRow
        onClick={() => setProjects(prev => [...prev, ''])}
        left={<span style={s.addBtn}>+ 프로젝트 추가</span>}
      />
      <Border />

      <ListHeader title="보유 기술/도구 (선택)" />
      <ListRow
        left={
          <TextField
            variant="line"
            label=""
            value={tools}
            onChange={e => setTools(e.target.value)}
            placeholder="예) AWS, Docker, Git"
          />
        }
      />
      <Border />

      <ListHeader title="기타 사항 (선택)" />
      <ListRow
        left={
          <TextField
            variant="line"
            label=""
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="추가로 입력할 내용이 있다면 적어주세요"
          />
        }
      />

      <FixedBottomCTA onClick={handleSubmit} disabled={!isValid}>
        분석 시작하기
      </FixedBottomCTA>

      <BottomSheet open={careerSheetOpen} onDimmerClick={() => setCareerSheetOpen(false)}>
        <BottomSheet.Header>경력 선택</BottomSheet.Header>
        {CAREER_LEVELS.map(c => (
          <ListRow
            key={c.value}
            onClick={() => { setCareerLevel(c.value); setCareerSheetOpen(false); }}
            left={<span style={s.rowLabel}>{c.label}</span>}
            right={careerLevel === c.value ? <span style={s.checkmark}>✓</span> : null}
          />
        ))}
      </BottomSheet>
    </>
  );
}

/* ──────────── Biz Form ──────────── */
function BizForm({ onSubmit }: { onSubmit: (spec: BizJobSpec) => void }) {
  const [internMonths, setInternMonths] = useState('');
  const [contestAwards, setContestAwards] = useState('');
  const [hasComputer1st, setHasComputer1st] = useState<'yes' | 'no' | null>(null);
  const [hasKoreanHistory, setHasKoreanHistory] = useState<'yes' | 'no' | null>(null);

  const isValid = hasComputer1st !== null && hasKoreanHistory !== null;

  return (
    <>
      <ListHeader title="인턴 경험" />
      <ListRow
        left={
          <TextField
            variant="line"
            label="인턴 기간 (개월)"
            value={internMonths}
            onChange={e => setInternMonths(e.target.value)}
            inputMode="numeric"
            placeholder="예) 6"
          />
        }
      />
      <Border />
      <ListHeader title="공모전·대외활동" />
      <ListRow
        left={
          <TextField
            variant="line"
            label="수상 횟수"
            value={contestAwards}
            onChange={e => setContestAwards(e.target.value)}
            inputMode="numeric"
            placeholder="예) 2"
          />
        }
      />
      <Border />
      <ListHeader title="보유 자격증" />
      <ListRow
        left={
          <div style={s.segmentedWrapper}>
            <span style={s.segmentedLabel}>컴퓨터활용능력 1급</span>
            <SegmentedControl value={hasComputer1st ?? ''} onChange={v => setHasComputer1st(v as 'yes' | 'no')}>
              <SegmentedControl.Item value="yes">있음</SegmentedControl.Item>
              <SegmentedControl.Item value="no">없음</SegmentedControl.Item>
            </SegmentedControl>
          </div>
        }
      />
      <ListRow
        left={
          <div style={s.segmentedWrapper}>
            <span style={s.segmentedLabel}>한국사능력검정</span>
            <SegmentedControl value={hasKoreanHistory ?? ''} onChange={v => setHasKoreanHistory(v as 'yes' | 'no')}>
              <SegmentedControl.Item value="yes">있음</SegmentedControl.Item>
              <SegmentedControl.Item value="no">없음</SegmentedControl.Item>
            </SegmentedControl>
          </div>
        }
      />
      <FixedBottomCTA
        onClick={() => onSubmit({
          internMonths: parseInt(internMonths || '0', 10),
          contestAwards: parseInt(contestAwards || '0', 10),
          hasComputer1st: hasComputer1st === 'yes',
          hasKoreanHistory: hasKoreanHistory === 'yes',
        })}
        disabled={!isValid}
      >
        분석 시작하기
      </FixedBottomCTA>
    </>
  );
}

/* ──────────── Finance Form ──────────── */
function FinanceForm({ onSubmit }: { onSubmit: (spec: FinanceJobSpec) => void }) {
  const [certInput, setCertInput] = useState('');
  const [financeCerts, setFinanceCerts] = useState<string[]>([]);
  const [hasFinanceIntern, setHasFinanceIntern] = useState<'yes' | 'no' | null>(null);
  const [accountingInput, setAccountingInput] = useState('');
  const [accountingCerts, setAccountingCerts] = useState<string[]>([]);

  const addCert = (input: string, setter: React.Dispatch<React.SetStateAction<string[]>>, inputSetter: React.Dispatch<React.SetStateAction<string>>) => {
    const val = input.trim();
    if (!val) return;
    setter(prev => prev.includes(val) ? prev : [...prev, val]);
    inputSetter('');
  };

  return (
    <>
      <ListHeader title="금융 자격증" />
      <ListRow
        left={
          <div style={{ width: '100%' }}>
            <TextField
              variant="line"
              label=""
              value={certInput}
              onChange={e => setCertInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCert(certInput, setFinanceCerts, setCertInput)}
              placeholder="예) CFA Level 1, 투자자산운용사"
            />
            {financeCerts.length > 0 && (
              <div style={s.tagRow}>
                {financeCerts.map(c => (
                  <div key={c} style={s.tag}>
                    <span style={s.tagText}>{c}</span>
                    <span style={s.tagRemove} onClick={() => setFinanceCerts(p => p.filter(x => x !== c))}>×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />
      <Border />
      <ListHeader title="금융권 인턴" />
      <ListRow
        left={
          <SegmentedControl value={hasFinanceIntern ?? ''} onChange={v => setHasFinanceIntern(v as 'yes' | 'no')}>
            <SegmentedControl.Item value="yes">경험 있음</SegmentedControl.Item>
            <SegmentedControl.Item value="no">경험 없음</SegmentedControl.Item>
          </SegmentedControl>
        }
      />
      <Border />
      <ListHeader title="회계 자격증 (선택)" />
      <ListRow
        left={
          <div style={{ width: '100%' }}>
            <TextField
              variant="line"
              label=""
              value={accountingInput}
              onChange={e => setAccountingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCert(accountingInput, setAccountingCerts, setAccountingInput)}
              placeholder="예) 전산세무 1급, 재경관리사"
            />
            {accountingCerts.length > 0 && (
              <div style={s.tagRow}>
                {accountingCerts.map(c => (
                  <div key={c} style={s.tag}>
                    <span style={s.tagText}>{c}</span>
                    <span style={s.tagRemove} onClick={() => setAccountingCerts(p => p.filter(x => x !== c))}>×</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      />
      <FixedBottomCTA
        onClick={() => onSubmit({ financeCerts, hasFinanceIntern: hasFinanceIntern === 'yes', accountingCerts })}
        disabled={hasFinanceIntern === null}
      >
        분석 시작하기
      </FixedBottomCTA>
    </>
  );
}

/* ──────────── Public Form ──────────── */
function PublicForm({ onSubmit }: { onSubmit: (spec: PublicJobSpec) => void }) {
  const [ncsLevel, setNcsLevel] = useState<'none' | 'basic' | 'intermediate' | 'advanced' | null>(null);
  const [koreanHistoryLevel, setKoreanHistoryLevel] = useState('');
  const [targetPublicType, setTargetPublicType] = useState('');

  const isValid = ncsLevel !== null && targetPublicType.trim();

  return (
    <>
      <ListHeader title="NCS 준비 수준" />
      <ListRow
        left={
          <SegmentedControl value={ncsLevel ?? ''} onChange={v => setNcsLevel(v as typeof ncsLevel)}>
            {NCS_LEVELS.map(n => (
              <SegmentedControl.Item key={n.value} value={n.value}>{n.label}</SegmentedControl.Item>
            ))}
          </SegmentedControl>
        }
      />
      <Border />
      <ListHeader title="한국사능력검정 (선택)" />
      <ListRow
        left={
          <TextField
            variant="line"
            label="취득 급수"
            value={koreanHistoryLevel}
            onChange={e => setKoreanHistoryLevel(e.target.value)}
            inputMode="numeric"
            placeholder="예) 1 (1~6급)"
          />
        }
      />
      <Border />
      <ListHeader title="목표 공기업" />
      <ListRow
        left={
          <TextField
            variant="line"
            label="목표 기관"
            value={targetPublicType}
            onChange={e => setTargetPublicType(e.target.value)}
            placeholder="예) 한국전력공사, 코레일"
          />
        }
      />
      <FixedBottomCTA
        onClick={() => onSubmit({
          ncsLevel: ncsLevel!,
          koreanHistoryLevel: parseInt(koreanHistoryLevel || '0', 10),
          targetPublicType,
        })}
        disabled={!isValid}
      >
        분석 시작하기
      </FixedBottomCTA>
    </>
  );
}

/* ──────────── Etc Form ──────────── */
function EtcForm({ commonSpec, onSubmit }: { commonSpec: CommonSpec; onSubmit: (spec: EtcJobSpec) => void }) {
  const [experience, setExperience] = useState('');

  return (
    <>
      <ListHeader title="직군 설명" />
      <ListRow
        left={<span style={s.rowLabel}>{commonSpec.etcJobDesc || '기타 직군'}</span>}
      />
      <Border />
      <ListHeader title="경력·경험" />
      <ListRow
        left={
          <TextField
            variant="line"
            label="관련 경험"
            value={experience}
            onChange={e => setExperience(e.target.value)}
            placeholder="관련 경험이나 준비 사항을 입력해주세요"
          />
        }
      />
      <FixedBottomCTA
        onClick={() => onSubmit({ jobDesc: commonSpec.etcJobDesc ?? '', experience })}
        disabled={!experience.trim()}
      >
        분석 시작하기
      </FixedBottomCTA>
    </>
  );
}

/* ──────────── Main JobForm ──────────── */
export default function JobForm({ commonSpec, onNext }: Props) {
  const jobInfo = JOB_TYPE_LABELS[commonSpec.jobType] ?? { label: '기타', emoji: '✨' };

  const handleSubmit = (jobSpec: JobSpec) => onNext(commonSpec, jobSpec);

  return (
    <div style={s.container}>
      <div style={s.scrollContent}>
        <Top title="스펙 입력" subtitleBottom="직무 관련 정보를 입력해주세요" />

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
        {(commonSpec.jobType === 'etc') && <EtcForm commonSpec={commonSpec} onSubmit={handleSubmit} />}
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
  stepper: {
    padding: '8px 24px 0',
  },
  rowLabel: {
    fontSize: 16,
    color: colors.grey900,
  },
  selectedValue: {
    fontSize: 14,
    color: colors.blue500,
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
  segmentedWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  segmentedLabel: {
    fontSize: 14,
    color: colors.grey600,
  },
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
  techInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  counter: {
    fontSize: 13,
    color: colors.grey600,
    flexShrink: 0,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 8,
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
};
