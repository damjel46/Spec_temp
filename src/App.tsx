import React, { useState, useEffect } from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import Intro from './screens/Intro';
import CommonForm from './screens/CommonForm';
import JobForm from './screens/JobForm';
import Loading from './screens/Loading';
import Result from './screens/Result';
import { CommonSpec, JobSpec, AnalysisResult } from './types/spec';

type Screen = 'intro' | 'common' | 'job' | 'loading' | 'result';

const STORAGE_KEY = 'spec_last_result';
const SPEC_KEY = 'spec_input';

function saveSpec(cs: CommonSpec | null, js: JobSpec | null) {
  try { localStorage.setItem(SPEC_KEY, JSON.stringify({ commonSpec: cs, jobSpec: js })); } catch { /* ignore */ }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [commonSpec, setCommonSpec] = useState<CommonSpec | null>(null);
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [copiedOpen, setCopiedOpen] = useState(false);
  const [prevResult, setPrevResult] = useState<AnalysisResult | null>(null);

  // 이전 결과 및 입력 스펙 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrevResult(JSON.parse(saved));
    } catch { /* ignore */ }
    try {
      const savedSpec = localStorage.getItem(SPEC_KEY);
      if (savedSpec) {
        const { commonSpec: cs, jobSpec: js } = JSON.parse(savedSpec);
        if (cs) setCommonSpec(cs);
        if (js) setJobSpec(js);
      }
    } catch { /* ignore */ }
  }, []);

  const handleDone = (r: AnalysisResult) => {
    setResult(r);
    setPrevResult(r);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); } catch { /* ignore */ }
    setScreen('result');
  };

  const handleError = () => setErrorOpen(true);

  const handleShare = async () => {
    const text = `📊 스펙 온도 분석 결과\n합격 가능성: ${result?.score}%\n${result?.grade}\n\n토스 앱에서 스펙 온도 검색하고 내 합격률 확인해봐!`;
    if (navigator.share) {
      try { await navigator.share({ title: '스펙 온도 분석 결과', text }); } catch { /* 취소 */ }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedOpen(true);
      } catch { setCopiedOpen(true); }
    } else {
      setCopiedOpen(true);
    }
  };

  if (screen === 'intro') {
    return (
      <>
        <Intro
          onStart={() => setScreen('common')}
          onShowPrevious={prevResult ? () => { setResult(prevResult); setScreen('result'); } : undefined}
        />
        {/* 오류 BottomSheet */}
        <BottomSheet open={errorOpen} onDimmerClick={() => setErrorOpen(false)}>
          <BottomSheet.Header>분석 중 오류가 발생했어요</BottomSheet.Header>
          <div style={{ padding: '8px 24px 16px', fontSize: 14, color: '#6b7684', lineHeight: 1.6 }}>
            일시적인 오류예요. API 키를 확인하거나 잠시 후 다시 시도해주세요.
          </div>
          <BottomSheet.CTA onClick={() => { setErrorOpen(false); setScreen('job'); }}>다시 시도하기</BottomSheet.CTA>
        </BottomSheet>
      </>
    );
  }

  if (screen === 'common') {
    return (
      <CommonForm
        initialData={commonSpec ?? undefined}
        onNext={(spec) => { setCommonSpec(spec); saveSpec(spec, jobSpec); setScreen('job'); }}
      />
    );
  }

  if (screen === 'job') {
    return (
      <JobForm
        commonSpec={commonSpec!}
        onNext={(cs, js) => { setCommonSpec(cs); setJobSpec(js); saveSpec(cs, js); setScreen('loading'); }}
        onBack={() => setScreen('common')}
      />
    );
  }

  if (screen === 'loading' && commonSpec && jobSpec) {
    return (
      <Loading
        commonSpec={commonSpec}
        jobSpec={jobSpec}
        onDone={handleDone}
        onError={handleError}
      />
    );
  }

  if (screen === 'result' && result) {
    return (
      <>
        <Result
          result={result}
          onRestart={() => { setResult(null); setScreen('intro'); }}
          onShare={handleShare}
        />
        {/* 복사 완료 BottomSheet */}
        <BottomSheet open={copiedOpen} onDimmerClick={() => setCopiedOpen(false)}>
          <BottomSheet.Header>이미지가 저장됐어요 ✓</BottomSheet.Header>
          <div style={{ padding: '8px 24px 16px', fontSize: 14, color: '#6b7684' }}>
            갤러리에서 확인하거나 카카오톡에 바로 공유하세요.
          </div>
          <BottomSheet.CTA onClick={() => setCopiedOpen(false)}>확인</BottomSheet.CTA>
        </BottomSheet>
        {/* 오류 BottomSheet (result 화면에서도 필요할 수 있음) */}
        <BottomSheet open={errorOpen} onDimmerClick={() => setErrorOpen(false)}>
          <BottomSheet.Header>분석 중 오류가 발생했어요</BottomSheet.Header>
          <div style={{ padding: '8px 24px 16px', fontSize: 14, color: '#6b7684', lineHeight: 1.6 }}>
            일시적인 오류예요. 잠시 후 다시 시도해주세요.
          </div>
          <BottomSheet.CTA onClick={() => { setErrorOpen(false); setScreen('job'); }}>다시 시도하기</BottomSheet.CTA>
        </BottomSheet>
      </>
    );
  }

  return <Intro onStart={() => setScreen('common')} />;
}
