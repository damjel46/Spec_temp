# 스펙 온도 — Claude Code 작업 지침

## 프로젝트 개요

앱인토스(토스 미니앱) 기반 AI 취업 경쟁력 분석 서비스.
스펙 입력 → gpt-4o-mini 합격자 데이터 기반 분석 → 큐넷 자격증 로드맵 제공.

- **플랫폼**: 앱인토스 미니앱 (WebView) / **수익화**: 인앱 광고 (IAA)

## 프로젝트 구조

```
src/
├── screens/      # 화면 컴포넌트
├── api/          # API 연동
├── components/   # 공용 컴포넌트
├── prompts/      # GPT 시스템 프롬프트
├── constants/    # 직군별 폼 정의
└── types/        # TypeScript 타입
```

## 작업별 참고 문서

- 화면/컴포넌트 작업 → @screen.md
- API·GPT·큐넷·프로모션 작업 → @api.md

## 링크

| 용도 | URL |
|------|-----|
| 앱인토스 개발자센터 | https://developers-apps-in-toss.toss.im |
| LLMs 전체 문서 | https://developers-apps-in-toss.toss.im/llms-full.txt |
| 앱인토스 콘솔 | https://apps-in-toss.toss.im |
