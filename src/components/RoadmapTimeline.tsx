import React from 'react';
import { colors } from '@toss/tds-colors';
import { CertExamSchedule } from '../types/spec';
import { formatDate } from '../api/examSchedule';

interface RoadmapItem {
  stage: number;
  period: string;
  name: string;
  desc: string;
}

interface Props {
  items: RoadmapItem[];
  schedules?: (CertExamSchedule | null)[];
}

const STAGE_COLORS = [colors.blue500, colors.blue500, colors.red500];

export default function RoadmapTimeline({ items, schedules }: Props) {
  return (
    <div style={{ position: 'relative', paddingLeft: 32 }}>
      {/* 세로 연결선 */}
      <div style={{
        position: 'absolute',
        left: 11,
        top: 12,
        bottom: 12,
        width: 2,
        background: colors.grey100,
      }} />

      {items.map((item, idx) => {
        const sched = schedules?.[idx];
        return (
          <div key={item.stage} style={{ position: 'relative', marginBottom: idx < items.length - 1 ? 20 : 0 }}>
            {/* 점 */}
            <div style={{
              position: 'absolute',
              left: -32,
              top: 2,
              width: 22,
              height: 22,
              borderRadius: 11,
              background: STAGE_COLORS[idx] ?? colors.grey600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{item.stage}</span>
            </div>

            {/* 카드 내용 */}
            <div>
              <span style={{ fontSize: 12, color: colors.grey600 }}>{item.stage}단계 · {item.period}</span>
              <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 600, color: colors.grey900 }}>{item.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: colors.grey600 }}>{item.desc}</p>

              {sched && (
                <div style={s.badge}>
                  <span>📅 {sched.implYy}년 {sched.implSeq}회</span>
                  {sched.docExamStartDt && (
                    <span style={s.dateChip}>필기 {formatDate(sched.docExamStartDt)}</span>
                  )}
                  {sched.pracExamStartDt && (
                    <span style={s.dateChip}>실기 {formatDate(sched.pracExamStartDt)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  badge: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    fontSize: 12,
    color: colors.blue500,
    fontWeight: 500,
  },
  dateChip: {
    background: '#EBF3FE',
    borderRadius: 6,
    padding: '2px 7px',
    fontSize: 11,
    color: colors.blue500,
    fontWeight: 500,
  },
};
