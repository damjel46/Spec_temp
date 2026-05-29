import { useCallback, useState } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-framework';

/**
 * 앱인토스 인앱 광고(IAA) 훅
 *
 * 사용 방법:
 *  1. Loading 화면 완료 시점에 loadAd() 호출 → 광고 미리 로드
 *  2. Result 화면에서 "다시 분석하기" 클릭 시 showAd(callback) 호출
 *
 * 앱인토스 광고 정책 준수:
 *  - isSupported() 체크 필수 (브라우저/개발 환경에서는 skip)
 *  - 예상치 못한 시점 노출 금지 → 반드시 사용자 액션 후 showAd 호출
 *  - 광고 표기 "광고" 레이블 시각적으로 표시 필요 (Result.tsx 참고)
 */

// 실제 광고 ID — 환경변수 우선, 없으면 실제 ID로 fallback
const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID ?? 'ait.v2.live.a913dc9aadf4458e';

type AdStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export function useAd() {
  const [adStatus, setAdStatus] = useState<AdStatus>('idle');

  /**
   * 광고를 미리 로드합니다.
   * Loading 화면에서 GPT 분석 완료 시점에 호출하세요.
   */
  const loadAd = useCallback(() => {
    if (!AD_GROUP_ID) return;
    if (GoogleAdMob.loadAppsInTossAdMob.isSupported() !== true) return;

    setAdStatus('loading');

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setAdStatus('loaded');
          cleanup();
        }
      },
      onError: () => {
        setAdStatus('failed');
        cleanup?.();
      },
    });
  }, []);

  /**
   * 로드된 광고를 사용자에게 표시합니다.
   * 반드시 사용자 액션(버튼 클릭 등) 후에 호출하세요.
   *
   * @param onDismissed 광고가 닫힌 후 실행할 콜백
   */
  const showAd = useCallback((onDismissed?: () => void) => {
    if (GoogleAdMob.showAppsInTossAdMob.isSupported() !== true) {
      onDismissed?.();
      return;
    }

    GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'dismissed' || event.type === 'failedToShow') {
          setAdStatus('idle');
          onDismissed?.();
        }
      },
      onError: () => {
        setAdStatus('idle');
        onDismissed?.();
      },
    });
  }, []);

  return { adStatus, loadAd, showAd };
}
