import React, { useState, useRef } from 'react';
import { Top, ListHeader, Border, BottomSheet } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { AnalysisResult, ActionPlanItem } from '../types/spec';
import CircularGauge from '../components/CircularGauge';
import SpecBarChart from '../components/SpecBarChart';
import RoadmapTimeline from '../components/RoadmapTimeline';
import ShareCard from '../components/ShareCard';
import { share, getTossShareLink, getSchemeUri, saveBase64Data } from '@apps-in-toss/web-framework';
import { getScoreTier } from '../utils/scoreTier';

interface Props {
  result: AnalysisResult;
  onRestart: () => void;
  onShare: () => void;
}

export default function Result({ result, onRestart, onShare }: Props) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleRestart = () => {
    onRestart();
  };

  const handleShareImage = async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImageUrl(dataUrl);
    } catch {
      // 캡처 실패 시 사용자에게 알림
      alert('이미지 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveImage = async () => {
    if (!shareImageUrl) return;

    // 1) 토스 네이티브 저장 API — isSupported 프로퍼티 없음, 직접 호출 후 catch
    try {
      const base64 = shareImageUrl.replace(/^data:image\/png;base64,/, '');
      await saveBase64Data({ data: base64, fileName: '스펙온도_결과.png', mimeType: 'image/png' });
      return;
    } catch { /* WebView 미지원 환경 → 다음 fallback */ }

    // 2) Web Share API with File (iOS/Android WebView 공유 시트 — 사진 저장 가능)
    try {
      const blob = await (await fetch(shareImageUrl)).blob();
      const file = new File([blob], '스펙온도_결과.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '스펙 온도 분석 결과' });
        return;
      }
    } catch { /* 다음 fallback으로 */ }

    // 3) 브라우저 다운로드 (데스크톱 미리보기 fallback)
    try {
      const a = document.createElement('a');
      a.href = shareImageUrl;
      a.download = '스펙온도_결과.png';
      a.click();
    } catch { /* ignore */ }
  };

  const handleShareFromModal = async () => {
    if (!shareImageUrl) return;

    // 1) 토스 네이티브 공유 API — isSupported 프로퍼티 없음, 직접 호출 후 catch
    try {
      const schemeUri = getSchemeUri();
      const tossLink = await getTossShareLink(schemeUri);
      const tier = getScoreTier(result.score);
      const message = `📊 내 스펙 온도 분석 결과\n${tier}\n\n"스펙 온도"로 취업 경쟁력 확인해봐!\n${tossLink}`;
      await share({ message });
      return;
    } catch { /* WebView 미지원 환경 → fallback */ }

    // 2) fallback: navigator.share (텍스트만)
    const text = `📊 스펙 온도 분석 결과\n${getScoreTier(result.score)}\n\n"스펙 온도"로 취업 경쟁력 확인해봐!`;
    try { await navigator.share({ title: '스펙 온도 분석 결과', text }); } catch { /* 취소 */ }
  };

  return (
    <div style={s.container}>
      {/* 캡처 전용 카드 — 화면 밖에 렌더 */}
      <ShareCard ref={cardRef} result={result} />

      <div style={s.scrollContent}>
        <Top title="분석 결과" />

        {/* 합격 가능성 */}
        <div style={s.gaugeSection}>
          <p style={s.sectionTitle}>{getScoreTier(result.score)}</p>
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

        {/* 1순위 행동 배너 */}
        {result.criticalAction && (
          <>
            <div style={s.criticalBanner}>
              <span style={s.criticalIcon}>🚨</span>
              <div>
                <p style={s.criticalTitle}>지금 당장 해야 할 1순위</p>
                <p style={s.criticalText}>{result.criticalAction}</p>
              </div>
            </div>
            <Border />
          </>
        )}

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
                  <ListHeader title="⚠️ 보완 필요" />
                  {result.weaknesses.map((item, i) => (
                    <div key={i} style={s.swRow}>
                      <span style={{ ...s.dot, background: colors.red500 }} />
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
            <RoadmapTimeline items={result.roadmap} />
          </div>
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

      </div>

      {/* 하단 고정 바 — 흰 배경으로 콘텐츠 가림 방지 */}
      <div style={s.bottomBar}>
        <div style={s.bottomActions}>
          <div style={s.restartWrap}>
            <button style={s.outlineBtn} onClick={handleRestart}>다시 분석하기</button>
          </div>
          <button style={{ ...s.primaryBtn, opacity: isCapturing ? 0.7 : 1 }} onClick={handleShareImage} disabled={isCapturing}>
            {isCapturing ? '이미지 생성 중...' : '결과 공유하기'}
          </button>
        </div>
        <p style={s.disclaimer}>
          AI 분석 결과는 참고용이며 실제 채용 기준과 다를 수 있어요.
        </p>
      </div>

      {/* 이미지 공유 BottomSheet */}
      <BottomSheet open={shareImageUrl !== null} onDimmerClick={() => setShareImageUrl(null)}>
        <BottomSheet.Header>결과 공유하기</BottomSheet.Header>
        <div style={{ padding: '0 24px 16px' }}>
          {shareImageUrl && (
            <img src={shareImageUrl} alt="결과 이미지" style={{ width: '100%', borderRadius: 12, display: 'block' }} />
          )}
        </div>
        <BottomSheet.DoubleCTA
          leftButton={
            <button style={s.doubleCtaOutline} onClick={handleSaveImage}>저장하기</button>
          }
          rightButton={
            <button style={s.doubleCtaPrimary} onClick={handleShareFromModal}>공유하기</button>
          }
        />
      </BottomSheet>
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
    paddingBottom: 160,
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
  criticalBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '0 24px 16px',
    padding: '14px 16px',
    background: '#FFF1F2',
    borderRadius: 12,
    borderLeft: `4px solid ${colors.red500}`,
  },
  criticalIcon: {
    fontSize: 22,
    flexShrink: 0,
  },
  criticalTitle: {
    margin: '0 0 2px',
    fontSize: 12,
    fontWeight: 600,
    color: colors.red500,
  },
  criticalText: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: colors.grey900,
    lineHeight: 1.4,
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
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 375,
    background: '#fff',
    borderTop: `1px solid ${colors.grey100}`,
    padding: '12px 24px 20px',
    boxSizing: 'border-box' as const,
  },
  bottomActions: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
  },
  restartWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
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
    textAlign: 'center',
    fontSize: 11,
    color: colors.grey600,
    margin: 0,
    lineHeight: 1.4,
  },
  doubleCtaOutline: {
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
  doubleCtaPrimary: {
    width: '100%',
    height: 52,
    border: 'none',
    borderRadius: 10,
    background: colors.blue500,
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
