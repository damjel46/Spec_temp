import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 앱 표시 이름 (앱인토스 콘솔 등록 명과 동일하게)
  appName: 'spectemp',

  // 브랜드 정보 — 로딩/런처 화면에 표시
  brand: {
    displayName: '스펙 온도',
    primaryColor: '#3182f6', // TDS blue500
    icon: './public/logo.png',
  },

  // 필요한 네이티브 권한 목록 (광고 외 추가 권한 없음)
  permissions: [],

  // 웹 개발 서버 설정
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
    },
  },

  // WebView 프레임 타입 — 일반 파트너 미니앱
  webViewProps: {
    type: 'partner',
  },

  // 빌드 산출물 디렉터리 (vite.config.ts의 outDir과 동일)
  outdir: 'dist',
});
