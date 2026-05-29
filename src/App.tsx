import React, { useState, useEffect, useRef } from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { share, getTossShareLink, getSchemeUri } from '@apps-in-toss/web-framework';
import { getScoreTier } from './utils/scoreTier';
import Intro from './screens/Intro';
import CommonForm from './screens/CommonForm';
import JobForm from './screens/JobForm';
import Loading from './screens/Loading';
import Result from './screens/Result';
import { CommonSpec, JobSpec, AnalysisResult } from './types/spec';
import { analyzeSpec } from './api/openai';
import { useAd } from './hooks/useAd';

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

  // 광고 훅 — 단일 인스턴스로 Loading/Result 화면이 adStatus를 공유
  const { adStatus, loadAd, showAd } = useAd();

  // 광고와 병렬로 실행되는 GPT 분석 Promise 보관
  const analysisPromiseRef = useRef<Promise<AnalysisResult> | null>(null);

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
    const tier = result ? getScoreTier(result.score) : '';
    const fallbackText = `📊 스펙 온도 분석 결과\n${result?.grade ?? ''}\n\n"스펙 온도"로 취업 경쟁력 확인해봐!`;
    try {
      const schemeUri = (getSchemeUri as any)?.() ?? 'intoss://spec-temp';
      const tossLink = await getTossShareLink(schemeUri);
      const message = `📊 내 스펙 온도 분석 결과\n${tier}\n\n"스펙 온도"로 취업 경쟁력 확인해봐!\n${tossLink}`;
      if ((share as any).isSupported?.() === true) {
        await share({ message });
        return;
      }
    } catch { /* ignore */ }
    // fallback
    if (navigator.share) {
      try { await navigator.share({ title: '스펙 온도 분석 결과', text: fallbackText }); } catch { /* 취소 */ }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fallbackText);
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
            일시적인 오류예요. 잠시 후 다시 시도해주세요.
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
        onNext={(spec) => { setCommonSpec(spec); saveSpec(spec, jobSpec); loadAd(); setScreen('job'); }}
      />
    );
  }

  if (screen === 'job') {
    return (
      <JobForm
        commonSpec={commonSpec!}
        initialData={jobSpec ?? undefined}
        onNext={(cs, js) => {
          setCommonSpec(cs);
          setJobSpec(js);
          saveSpec(cs, js);

          // ① GPT 분석 즉시 시작 (광고와 병렬)
          let earlyResult: AnalysisResult | null = null;
          const promise = analyzeSpec(cs, js);
          promise.then((r) => { earlyResult = r; }).catch(() => {});
          analysisPromiseRef.current = promise;

          // ② 광고 시작 — 광고가 끝날 때 분석도 이미 완료됐으면 바로 result로
          showAd(() => {
            if (earlyResult) {
              handleDone(earlyResult);          // Loading 화면 스킵
            } else {
              setScreen('loading');             // 아직 분석 중 → Loading 대기
            }
          });
        }}
        onBack={() => setScreen('common')}
      />
    );
  }

  if (screen === 'loading' && commonSpec && jobSpec) {
    return (
      <Loading
        commonSpec={commonSpec}
        jobSpec={jobSpec}
        analysisPromise={analysisPromiseRef.current ?? undefined}
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
