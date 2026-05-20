import React from 'react';
import { colors } from '@toss/tds-colors';

interface Props {
  scores: {
    jobFit: number;
    education: number;
    experience: number;
    language: number;
    certificate: number;
  };
}

const ITEMS = [
  { key: 'jobFit' as const, label: '직무 적합성' },
  { key: 'education' as const, label: '전공/학력' },
  { key: 'experience' as const, label: '경력/경험' },
  { key: 'language' as const, label: '어학' },
  { key: 'certificate' as const, label: '자격증' },
];

export default function SpecBarChart({ scores }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ITEMS.map(({ key, label }) => (
        <div key={key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: colors.grey900 }}>{label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.blue500 }}>{scores[key]}</span>
          </div>
          <div style={{ height: 8, background: colors.grey100, borderRadius: 4, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${scores[key]}%`,
                background: colors.blue500,
                borderRadius: 4,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
