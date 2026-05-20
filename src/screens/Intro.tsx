import React from 'react';
import { Top } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';

interface Props {
  onStart: () => void;
}

const FEATURES = [
  {
    emoji: '🔍',
    title: 'AI가 합격률을 분석',
    desc: '직업 직무·공스펙을 종합 분석',
  },
  {
    emoji: '📊',
    title: '스펙 점수와 강약점 진단',
    desc: '항목별 점수로 강점을 파악',
  },
  {
    emoji: '🗺️',
    title: '맞춤형 인증 로드맵 제공',
    desc: '합격에 필요한 인증을 단계별로 추천',
  },
];

export default function Intro({ onStart }: Props) {
  return (
    <div style={s.container}>
      <Top title="스펙 온도" />

      <div style={s.hero}>
        <div style={s.iconWrap}>
          <span style={s.icon}>🌡️</span>
        </div>
        <h1 style={s.headline}>내 스펙의 온도는{'\n'}몇 도일까요?</h1>
        <p style={s.subtext}>
          직관한 직무에 합격할 확률을 분석하고,{'\n'}인증 로드맵을 추천해드려요.
        </p>
      </div>

      <div style={s.features}>
        {FEATURES.map((f) => (
          <div key={f.title} style={s.featureRow}>
            <div style={s.featureIcon}>{f.emoji}</div>
            <div>
              <p style={s.featureTitle}>{f.title}</p>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={s.bottomBar}>
        <button style={s.startBtn} onClick={onStart}>시작하기</button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 375,
    margin: '0 auto',
    minHeight: '100vh',
    position: 'relative',
    paddingBottom: 120,
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 24px 24px',
    textAlign: 'center',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 32,
    background: 'linear-gradient(135deg, #4fa8f8 0%, #3182f6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0 8px 24px rgba(49,130,246,0.25)',
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.grey900,
    lineHeight: 1.4,
    margin: '0 0 12px',
    whiteSpace: 'pre-line',
  },
  subtext: {
    fontSize: 14,
    color: colors.grey600,
    lineHeight: 1.6,
    margin: 0,
    whiteSpace: 'pre-line',
  },
  bottomBar: {
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 375,
    padding: '12px 24px 28px',
    background: '#fff',
    boxSizing: 'border-box' as const,
  },
  startBtn: {
    width: '100%',
    height: 52,
    background: colors.blue500,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
  },
  features: {
    padding: '8px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px',
    background: colors.grey100,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 28,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff',
    borderRadius: 12,
    flexShrink: 0,
  },
  featureTitle: {
    margin: '0 0 2px',
    fontSize: 15,
    fontWeight: 600,
    color: colors.grey900,
  },
  featureDesc: {
    margin: 0,
    fontSize: 13,
    color: colors.grey600,
  },
};
