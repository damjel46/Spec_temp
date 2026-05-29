import React, { useEffect } from 'react';
import { Top } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { CommonSpec, JobSpec, AnalysisResult } from '../types/spec';
import { analyzeSpec } from '../api/openai';

interface Props {
  commonSpec: CommonSpec;
  jobSpec: JobSpec;
  /** App에서 광고와 병렬로 이미 시작된 분석 Promise. 없으면 여기서 새로 요청. */
  analysisPromise?: Promise<AnalysisResult>;
  onDone: (result: AnalysisResult) => void;
  onError: () => void;
}

const SkeletonBar = ({ width = '100%', height = 16 }: { width?: string | number; height?: number }) => (
  <div style={{ width, height, background: colors.grey100, borderRadius: 4 }} />
);

export default function Loading({ commonSpec, jobSpec, analysisPromise, onDone, onError }: Props) {
  useEffect(() => {
    // 90초 초과 시 에러 처리
    const timeout = setTimeout(() => {
      onError();
    }, 90_000);

    // 이미 실행 중인 Promise가 있으면 그걸 기다리고, 없으면 새로 요청
    const promise = analysisPromise ?? analyzeSpec(commonSpec, jobSpec);
    promise
      .then((result) => {
        onDone(result);
      })
      .catch(onError)
      .finally(() => clearTimeout(timeout));

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div style={s.container}>
      <Top title="분석 중" />

      <div style={s.content}>
        <div style={s.illustration}>🪐</div>
        <p style={s.title}>AI가 스펙을 분석하고 있어요</p>
        <p style={s.subtitle}>
          GPT가 입력하신 정보를 바탕으로{'\n'}합격 확률과 맞춤 로드맵을 만들고 있어요.
        </p>

        <div style={s.skeletons}>
          <SkeletonBar height={18} />
          <div style={{ height: 8 }} />
          <SkeletonBar width="80%" height={18} />
          <div style={{ height: 8 }} />
          <SkeletonBar width="60%" height={18} />
          <div style={{ height: 24 }} />
          <SkeletonBar height={60} />
          <div style={{ height: 8 }} />
          <SkeletonBar height={60} />
        </div>
      </div>

      <p style={s.hint}>
        ⏱ 분석은 보통 30초~1분 정도 소요돼요.{'\n'}잠시만 기다려주세요.
      </p>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 375,
    margin: '0 auto',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px 0',
    textAlign: 'center',
  },
  illustration: {
    fontSize: 80,
    marginBottom: 24,
    animation: 'none',
  },
  title: {
    margin: '0 0 8px',
    fontSize: 20,
    fontWeight: 700,
    color: colors.grey900,
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: 14,
    color: colors.grey600,
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  },
  skeletons: {
    width: '100%',
  },
  hint: {
    margin: '0 24px 32px',
    fontSize: 13,
    color: colors.grey600,
    textAlign: 'center',
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
  },
};
