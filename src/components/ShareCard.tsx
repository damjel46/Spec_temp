import React from 'react';
import { AnalysisResult } from '../types/spec';
import { getScoreTier } from '../utils/scoreTier';

interface Props {
  result: AnalysisResult;
}

const ShareCard = React.forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const topStrengths = result.strengths?.slice(0, 2) ?? [];
  const tip = result.positioningTip ?? result.gradeDesc ?? '';
  const clampedTip = tip.length > 60 ? tip.slice(0, 60) + '…' : tip;

  const scoreColor =
    result.score >= 80 ? '#03b26c' :
    result.score >= 60 ? '#3182f6' :
    result.score >= 40 ? '#fe9800' : '#f04452';

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: -9999,
        top: 0,
        width: 375,
        background: '#ffffff',
        fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* 헤더 */}
      <div style={{
        background: '#f2f4f6',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e8eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#191f28' }}>스펙 온도</span>
        </div>
        <span style={{ fontSize: 12, color: '#6b7684', fontWeight: 500 }}>취업 스펙 분석</span>
      </div>

      {/* 점수 섹션 */}
      <div style={{
        padding: '28px 20px 24px',
        textAlign: 'center',
        borderBottom: '1px solid #f2f4f6',
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: scoreColor,
          lineHeight: 1,
          letterSpacing: '-2px',
        }}>
          {result.score}%
        </div>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: scoreColor,
          marginTop: 10,
        }}>
          {getScoreTier(result.score)}
        </div>
      </div>

      {/* 강점 */}
      {topStrengths.length > 0 && (
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f2f4f6',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7684', marginBottom: 10, letterSpacing: '0.04em' }}>
            나의 강점
          </div>
          {topStrengths.map((s, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: i < topStrengths.length - 1 ? 8 : 0,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: '#03b26c', color: '#fff',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>✓</span>
              <span style={{ fontSize: 13, color: '#191f28', lineHeight: 1.5, flex: 1 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* 포지셔닝 */}
      {clampedTip && (
        <div style={{
          padding: '16px 20px',
          background: '#eef4ff',
          borderLeft: '3px solid #3182f6',
          margin: '0 0 0 0',
          borderBottom: '1px solid #f2f4f6',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#3182f6', marginBottom: 6 }}>💡 직무 포지셔닝</div>
          <div style={{ fontSize: 13, color: '#191f28', lineHeight: 1.55 }}>{clampedTip}</div>
        </div>
      )}

      {/* CTA 푸터 */}
      <div style={{
        background: '#3182f6',
        padding: '18px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
          토스에서 '스펙 온도' 검색하고
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
          내 합격 가능성을 분석해봐!
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
