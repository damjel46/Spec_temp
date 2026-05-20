# TDS 화면 작업 지침

## 절대 규칙 (어기면 심사 반려)

- 모든 화면 최상단에 **Navigation 컴포넌트** 반드시 배치
- **라이트 모드만** 개발 (다크 모드 미지원)
- 화면 기준 가로 **375px**
- 진입 즉시 바텀싯 강제 노출 금지
- Back 버튼 눌렀을 때 이전 화면 막는 팝업 금지

## 화면 기본 구조

```
Screen
  └── Top (페이지 타이틀 + 설명)
  └── ListHeader (섹션 제목)
  └── ListRow × N (콘텐츠/입력)
  └── Border (섹션 구분)
  └── FixedBottomCTA (하단 고정 버튼)
```

## 컴포넌트 매핑

| 목적 | 컴포넌트 |
|------|---------|
| 페이지 타이틀 | `Top` |
| 리스트/카드 | `ListRow` (Card UI 대신) |
| 섹션 제목 | `ListHeader` |
| 구분선 | `Border` |
| 하단 CTA | `FixedBottomCTA` / `BottomCTA.Double` |
| 텍스트 입력 | `TextField` / `TextArea` |
| 직군 탭 | `Tab` / `SegmentedControl` |
| 단계 표시 | `ProgressStepper` |
| AI 로딩 | `Skeleton` |
| 스펙 시각화 | `BarChart` |
| 선택 팝업 | `BottomSheet` |
| 완료/결과 | `Result` |

## 컬러 시스템

```ts
import { colors } from '@toss/tds-colors';

colors.blue500    // #3182f6  주 액션, 강조
colors.grey900    // #191f28  주 텍스트
colors.grey600    // #6b7684  보조 텍스트
colors.grey100    // #f2f4f6  배경 서피스
colors.green500   // #03b26c  성공, 긍정
colors.red500     // #f04452  경고, 오류
colors.orange500  // #fe9800  주의
```

## 타이포그래피

```
heading1  24px / 700 / -0.5px letterSpacing
heading2  20px / 700 / -0.3px
body1     16px / 400
body2     14px / 400
caption   12px / 400  색상: grey600
```

폰트: 토스 앱 내에서 자동으로 **Toss Product Sans** 적용. 별도 설정 불필요.

## 화면 목록

| 파일 | 역할 |
|------|------|
| `Intro.tsx` | 시작 화면 |
| `CommonForm.tsx` | 공통 스펙 입력 |
| `JobForm.tsx` | 직군별 추가 입력 |
| `Loading.tsx` | GPT 분석 중 (Skeleton) |
| `Result.tsx` | 분석 결과 리포트 |

## 성능 / 접근성

- Skeleton UI로 로딩 상태 반드시 표시
- 색상만으로 정보 전달 금지
- 최소 터치 영역 44×44px

## 링크

| 용도 | URL |
|------|-----|
| TDS 컴포넌트 문서 | https://tossmini-docs.toss.im/tds-mobile |
