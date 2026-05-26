import React, { useState, useEffect } from 'react';
import { Top, ListHeader, Border } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { AnalysisResult, CertExamSchedule } from '../types/spec';
import { CERT_CODE_MAP } from '../constants/certCodeMap';
import { fetchNextExamSchedule } from '../api/examSchedule';
import CircularGauge from '../components/CircularGauge';
import SpecBarChart from '../components/SpecBarChart';
import RoadmapTimeline from '../components/RoadmapTimeline';
import { useAd } from '../hooks/useAd';
import { getQnetSearchUrl } from '../api/qnet';

interface Props {
  result: AnalysisResult;
  onRestart: () => void;
  onShare: () => void;
}

export default function Result({ result, onRestart, onShare }: Props) {
  const { adStatus, showAd } = useAd();
  const [schedules, setSchedules] = useState<(CertExamSchedule | null)[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(
        result.roadmap.map(async (item) => {
          const entry = CERT_CODE_MAP[item.name];
          if (!entry) return null;
          try {
            return await fetchNextExamSchedule(entry.jmCd, entry.qualgbCd);
          } catch {
            return null;
          }
        }),
      );
      if (!cancelled) setSchedules(results);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleRestart = () => {
    if (adStatus === 'loaded') {
      showAd(onRestart);
    } else {
      onRestart();
    }
  };

  return (
    <div style={s.container}>
      <div style={s.scrollContent}>
        <Top title="분석 결과" />

        {/* 합격 가능성 */}
        <div style={s.gaugeSection}>
          <p style={s.sectionTitle}>합격 가능성</p>
          <CircularGauge score={result.score} />
          <p style={s.grade}>{result.grade}</p>
          <p style={s.gradeDesc}>{result.gradeDesc}</p>
        </div>

        <Border />

        {/* 스펙 점수 */}
        <div style={s.section}>
          <ListHeader title="스펙 점수" />
          <div style={s.chartWrap}>
            <SpecBarChart scores={result.specScores} />
          </div>
        </div>

        <Border />

        {/* 맞춤 인증 로드맵 */}
        <div style={s.section}>
          <ListHeader title="맞춤 인증 로드맵" />
          <div style={s.timelineWrap}>
            <RoadmapTimeline items={result.roadmap} schedules={schedules} />
          </div>
          {result.roadmap.map((item) => (
            <p
              key={item.stage}
              style={s.roadmapLink}
              onClick={() => window.open(getQnetSearchUrl(item.name), '_blank')}
            >
              {item.name} 일정 큐넷에서 확인하기 &gt;
            </p>
          ))}
        </div>

        <div style={{ height: 100 }} />
      </div>

      {/* 하단 더블 버튼 */}
      <div style={s.bottomActions}>
        <div style={s.restartWrap}>
          {adStatus === 'loaded' && (
            <p style={s.adLabel}>광고</p>
          )}
          <button style={s.outlineBtn} onClick={handleRestart}>다시 분석하기</button>
        </div>
        <button style={s.primaryBtn} onClick={onShare}>결과 공유하기</button>
      </div>

      {/* AI 면책 문구 */}
      <p style={s.disclaimer}>
        AI 분석 결과는 참고용이며 실제 채용 기준과 다를 수 있어요.
      </p>
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
    paddingBottom: 140,
  },
  gaugeSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 24px 20px',
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
    color: colors.grey900,
    alignSelf: 'flex-start',
  },
  grade: {
    margin: '12px 0 4px',
    fontSize: 20,
    fontWeight: 700,
    color: colors.blue500,
  },
  gradeDesc: {
    margin: 0,
    fontSize: 14,
    color: colors.grey600,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  section: {
    paddingBottom: 8,
  },
  chartWrap: {
    padding: '8px 24px 16px',
  },
  timelineWrap: {
    padding: '8px 24px 16px',
  },
  roadmapLink: {
    margin: '0 24px 8px',
    fontSize: 14,
    color: colors.blue500,
    fontWeight: 500,
    cursor: 'pointer',
  },
  bottomActions: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 48px)',
    maxWidth: 327,
    display: 'flex',
    gap: 8,
  },
  restartWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
  },
  adLabel: {
    margin: 0,
    fontSize: 10,
    color: colors.grey600,
    border: `1px solid ${colors.grey600}`,
    borderRadius: 2,
    padding: '0 4px',
    lineHeight: 1.6,
  },
  outlineBtn: {
    width: '100%',
    height: 52,
    border: `1.5px solid ${colors.blue500}`,
    borderRadius: 10,
    background: '#fff',
    color: colors.blue500,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    border: 'none',
    borderRadius: 10,
    background: colors.blue500,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  disclaimer: {
    position: 'fixed',
    bottom: 4,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 11,
    color: colors.grey600,
    margin: 0,
  },
};
