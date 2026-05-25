import type { VercelRequest, VercelResponse } from '@vercel/node';

const QNET_BASE = 'https://openapi.hrdkorea.or.kr/api/v1/examination';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.QNET_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '큐넷 API 키가 설정되지 않았어요' });

  const { qualCode } = req.query;
  if (!qualCode || typeof qualCode !== 'string') {
    return res.status(400).json({ error: '자격증 코드(qualCode)가 필요해요' });
  }

  try {
    const qnetRes = await fetch(
      `${QNET_BASE}/schedule?serviceKey=${encodeURIComponent(apiKey)}&qualCode=${encodeURIComponent(qualCode)}&dataFormat=json`,
      { headers: { Accept: 'application/json' } }
    );

    if (!qnetRes.ok) {
      console.error('큐넷 API 오류:', qnetRes.status);
      // fallback: 큐넷 직접 링크 제공
      return res.status(200).json({
        fallback: true,
        fallbackUrl: `https://www.q-net.or.kr/crf021.do?id=crf02101&gSite=Q&gId=`,
      });
    }

    const data = await qnetRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('큐넷 API 연결 오류:', error);
    // 네트워크 오류 시 fallback URL 반환
    return res.status(200).json({
      fallback: true,
      fallbackUrl: 'https://www.q-net.or.kr/crf005.do',
    });
  }
}
