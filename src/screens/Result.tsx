import React, { useState, useEffect, useRef } from 'react';
import { Top, ListHeader, Border } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { AnalysisResult, ActionPlanItem, CertExamSchedule } from '../types/spec';
import { CERT_CODE_MAP } from '../constants/certCodeMap';
import { fetchNextExamSchedule } from '../api/examSchedule';
import CircularGauge from '../components/CircularGauge';
import SpecBarChart from '../components/SpecBarChart';
import RoadmapTimeline from '../components/RoadmapTimeline';
import ShareCard from '../components/ShareCard';
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleShareImage = async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImageUrl(dataUrl);
    } catch {
      // 캡처 실패 시 무시
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div style={s.container}>
      {/* 캡처 전용 카드 — 화면 밖에 렌더 */}
      <ShareCard ref={cardRef} result={result} />

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

        {/* 직무 포지셔닝 인사이트 */}
        {result.positioningTip && (
          <>
            <div style={s.section}>
              <ListHeader title="💡 직무 포지셔닝" />
              <div style={s.tipBox}>
                <p style={s.tipText}>{result.positioningTip}</p>
              </div>
            </div>
            <Border />
          </>
        )}

        {/* 스펙 점수 */}
        <div style={s.section}>
          <ListHeader title="스펙 점수" />
          <div style={s.chartWrap}>
            <SpecBarChart scores={result.specScores} />
          </div>
        </div>

        <Border />

        {/* 강점 & 보완점 */}
        {(result.strengths?.length > 0 || result.weaknesses?.length > 0) && (
          <>
            <div style={s.section}>
              {result.strengths?.length > 0 && (
                <>
                  <ListHeader title="✅ 강점" />
                  {result.strengths.map((item, i) => (
                    <div key={i} style={s.swRow}>
                      <span style={{ ...s.dot, background: colors.green500 }} />
                      <p style={s.swText}>{item}</p>
                    </div>
                  ))}
                </>
              )}
              {result.weaknesses?.length > 0 && (
                <>
                  <ListHeader title="🔧 보완 필요" />
                  {result.weaknesses.map((item, i) => (
                    <div key={i} style={s.swRow}>
                      <span style={{ ...s.dot, background: colors.orange500 }} />
                      <p style={s.swText}>{item}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
            <Border />
          </>
        )}

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

        {/* 지금 해야 할 일 */}
        {result.actionPlan?.length > 0 && (
          <>
            <Border />
            <div style={s.section}>
              <ListHeader title="🗓 지금 해야 할 일" />
              {result.actionPlan.map((item, i) => (
                <div key={i} style={s.actionRow}>
                  <span style={{ ...s.urgencyBadge, background: URGENCY_COLOR[item.urgency] }}>
                    {URGENCY_LABEL[item.urgency]}
                  </span>
                  <div style={s.actionContent}>
                    <p style={s.actionLabel}>{item.label}</p>
                    <p style={s.actionDetail}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

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
        <button style={{ ...s.primaryBtn, opacity: isCapturing ? 0.7 : 1 }} onClick={handleShareImage} disabled={isCapturing}>
          {isCapturing ? '이미지 생성 중...' : '결과 이미지 보기'}
        </button>
      </div>

      {/* AI 면책 문구 */}
      <p style={s.disclaimer}>
        AI 분석 결과는 참고용이며 실제 채용 기준과 다를 수 있어요.
      </p>

      {/* 이미지 저장 모달 */}
      {shareImageUrl && (
        <div style={s.imageModal} onClick={() => setShareImageUrl(null)}>
          <div style={s.imageModalInner} onClick={e => e.stopPropagation()}>
            <p style={s.imageModalGuide}>이미지를 <strong>길게 눌러</strong> 저장하세요</p>
            <img src={shareImageUrl} alt="결과 이미지" style={s.shareImg} />
            <button style={s.imageModalClose} onClick={() => setShareImageUrl(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

const URGENCY_LABEL: Record<ActionPlanItem['urgency'], string> = {
  immediate: '즉시',
  short: '2개월',
  mid: '5개월',
  long: '하반기',
};

const URGENCY_COLOR: Record<ActionPlanItem['urgency'], string> = {
  immediate: colors.red500,
  short: colors.orange500,
  mid: colors.blue500,
  long: colors.green500,
};

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
  tipBox: {
    margin: '0 24px 16px',
    padding: '14px 16px',
    background: `${colors.blue500}14`,
    borderRadius: 10,
    borderLeft: `3px solid ${colors.blue500}`,
  },
  tipText: {
    margin: 0,
    fontSize: 14,
    color: colors.grey900,
    lineHeight: 1.6,
  },
  swRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 24px',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 5,
  },
  swText: {
    margin: 0,
    fontSize: 14,
    color: colors.grey900,
    lineHeight: 1.55,
    flex: 1,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: '12px 24px',
    borderBottom: `1px solid ${colors.grey100}`,
  },
  urgencyBadge: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    borderRadius: 6,
    padding: '3px 8px',
    marginTop: 1,
    whiteSpace: 'nowrap' as const,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    margin: '0 0 2px',
    fontSize: 14,
    fontWeight: 600,
    color: colors.grey900,
  },
  actionDetail: {
    margin: 0,
    fontSize: 12,
    color: colors.grey600,
    lineHeight: 1.5,
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
  imageModal: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '24px 16px',
  },
  imageModalInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 375,
  },
  imageModalGuide: {
    margin: 0,
    fontSize: 15,
    color: '#fff',
    textAlign: 'center' as const,
    lineHeight: 1.5,
  },
  shareImg: {
    width: '100%',
    borderRadius: 16,
    display: 'block',
  },
  imageModalClose: {
    height: 44,
    padding: '0 32px',
    borderRadius: 22,
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
