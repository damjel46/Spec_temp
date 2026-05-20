import React from 'react';
import { colors } from '@toss/tds-colors';

interface Props {
  score: number;
}

export default function CircularGauge({ score }: Props) {
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle
        cx="80" cy="80" r={radius}
        fill="none"
        stroke={colors.grey100}
        strokeWidth={strokeWidth}
      />
      <circle
        cx="80" cy="80" r={radius}
        fill="none"
        stroke={colors.blue500}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 80 80)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text
        x="80" y="76"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="28"
        fontWeight="700"
        fill={colors.grey900}
      >
        {score}%
      </text>
    </svg>
  );
}
