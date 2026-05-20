import React, { useState } from 'react';
import Intro from './screens/Intro';
import CommonForm from './screens/CommonForm';
import JobForm from './screens/JobForm';
import Loading from './screens/Loading';
import Result from './screens/Result';
import { CommonSpec, JobSpec, AnalysisResult } from './types/spec';

type Screen = 'intro' | 'common' | 'job' | 'loading' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [commonSpec, setCommonSpec] = useState<CommonSpec | null>(null);
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

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

  if (screen === 'job' && commonSpec) {
    return (
      <JobForm
        commonSpec={commonSpec}
        onNext={(cs, js) => {
          setCommonSpec(cs);
          setJobSpec(js);
          setScreen('loading');
        }}
      />
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
