import React, { useState } from 'react';
import Intro from './screens/Intro';
import CommonForm from './screens/CommonForm';
import JobForm from './screens/JobForm';
import Loading from './screens/Loading';
import Result from './screens/Result';
import { CommonSpec, JobSpec, AnalysisResult, JobType } from './types/spec';

type Screen = 'intro' | 'common' | 'job' | 'loading' | 'result';

const DEV_JOB_TYPES: { label: string; value: JobType }[] = [
  { label: '개발', value: 'dev' },
  { label: '경영', value: 'biz' },
  { label: '금융', value: 'finance' },
  { label: '공기업', value: 'public' },
  { label: '기타', value: 'etc' },
];

const DEV_COMMON_SPEC: CommonSpec = {
  eduLevel: 'college',
  schoolName: '테스트대학교',
  major: '컴퓨터공학',
  gpa: 3.8,
  languages: [{ test: 'TOEIC', score: '850', date: '2024.01' }],
  targetCompany: 'large',
  situation: 'jobseeker',
  jobType: 'dev',
};

function DevNav({ current, onChange }: { current: JobType; onChange: (j: JobType) => void }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 375, zIndex: 9999,
      background: 'rgba(25,31,40,0.92)', backdropFilter: 'blur(4px)',
      display: 'flex', gap: 4, padding: '6px 8px',
      boxSizing: 'border-box' as const,
    }}>
      {DEV_JOB_TYPES.map(j => (
        <button
          key={j.value}
          onClick={() => onChange(j.value)}
          style={{
            flex: 1, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
            background: current === j.value ? '#3182f6' : 'rgba(255,255,255,0.1)',
            color: current === j.value ? '#fff' : 'rgba(255,255,255,0.5)',
          }}
        >
          {j.label}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('job');
  const [commonSpec, setCommonSpec] = useState<CommonSpec | null>(null);
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [devJobType, setDevJobType] = useState<JobType>('dev');

  const handleDevJobChange = (j: JobType) => {
    setDevJobType(j);
    setScreen('job');
    setCommonSpec({ ...DEV_COMMON_SPEC, jobType: j });
  };

  const handleError = () => {
    alert('분석 중 오류가 발생했어요. 다시 시도해주세요.');
    setScreen('job');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: '스펙 온도 분석 결과', text: `내 합격 가능성은 ${result?.score}%!` });
    } else {
      alert('공유 기능은 모바일 앱에서 지원돼요.');
    }
  };

  if (screen === 'intro') {
    return <Intro onStart={() => setScreen('common')} />;
  }

  if (screen === 'common') {
    return (
      <CommonForm
        onNext={(spec) => {
          setCommonSpec(spec);
          setScreen('job');
        }}
      />
    );
  }

  if (screen === 'job') {
    return (
      <>
        <DevNav current={devJobType} onChange={handleDevJobChange} />
        <div style={{ paddingTop: 40 }}>
          <JobForm
            commonSpec={commonSpec ?? { ...DEV_COMMON_SPEC, jobType: devJobType }}
            onNext={(cs, js) => {
              setCommonSpec(cs);
              setJobSpec(js);
              setScreen('loading');
            }}
            onBack={() => setScreen('common')}
          />
        </div>
      </>
    );
  }

  if (screen === 'loading' && commonSpec && jobSpec) {
    return (
      <Loading
        commonSpec={commonSpec}
        jobSpec={jobSpec}
        onDone={(r) => {
          setResult(r);
          setScreen('result');
        }}
        onError={handleError}
      />
    );
  }

  if (screen === 'result' && result) {
    return (
      <Result
        result={result}
        onRestart={() => {
          setCommonSpec(null);
          setJobSpec(null);
          setResult(null);
          setScreen('intro');
        }}
        onShare={handleShare}
      />
    );
  }

  return <Intro onStart={() => setScreen('common')} />;
}
