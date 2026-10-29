/**
 * 今日の日付を YYYY-MM-DD 形式で取得
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * YYYY-MM-DD 文字列を Date オブジェクトに変換
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 日付の表示用フォーマット (例: 2026/10/29)
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '未記録';
  const [y, m, d] = dateStr.split('-');
  return `${y}/${m}/${d}`;
}

/**
 * 相対的な日付表現を返す (メーラーの一覧画面風: 「今日」「昨日」「3日前」「2週間前」など)
 */
export function getRelativeDateString(dateStr: string): string {
  if (!dateStr) return '未記録';
  const target = parseDate(dateStr);
  const today = parseDate(getTodayString());

  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays > 1 && diffDays < 7) return `${diffDays}日前`;
  if (diffDays >= 7 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間前`;
  }
  if (diffDays >= 30 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}か月前`;
  }
  if (diffDays >= 365) {
    return formatDate(dateStr);
  }
  return `${Math.abs(diffDays)}日後`;
}
