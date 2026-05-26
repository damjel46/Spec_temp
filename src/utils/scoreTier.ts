export function getScoreTier(score: number): string {
  if (score >= 90) return '스펙 최상위권! 🏆';
  if (score >= 75) return '스펙 상위권! 🎉';
  if (score >= 60) return '경쟁력 있어요! 👍';
  if (score >= 45) return '평균 수준이에요 📊';
  if (score >= 30) return '보완이 필요해요 💪';
  return '기초부터 시작해요 🌱';
}
