import { InventoryItem } from '../types';

/**
 * Googleカレンダーを開くURL
 */
export function getGoogleCalendarUrl(): string {
  return 'https://calendar.google.com/';
}

/**
 * Googleカレンダーに次回購入予定日を追加するURL（URLリンク方式）
 * 終日予定として今日〜翌日の日付を設定
 * 件名: 買い物: アイテム名（複数選択時は「買い物: ○○、△△ 他N件」）
 * 詳細: 選択したアイテム名と最終購入日のリスト
 */
export function createGoogleCalendarEventUrl(items: InventoryItem[]): string {
  if (items.length === 0) {
    return getGoogleCalendarUrl();
  }

  // 件名の生成
  let title = '';
  if (items.length === 1) {
    title = `買い物: ${items[0].name}`;
  } else if (items.length === 2) {
    title = `買い物: ${items[0].name}、${items[1].name}`;
  } else {
    title = `買い物: ${items[0].name}、${items[1].name} 他${items.length - 2}件`;
  }

  // 詳細の生成 (アイテム名と最終購入日のリスト)
  const detailLines: string[] = [
    '【購入予定アイテム】',
    ...items.map(item => {
      const latest = item.purchaseHistory[0];
      const dateStr = latest ? latest.date : '未記録';
      return `・${item.name}（最終購入日: ${dateStr}）`;
    })
  ];
  const details = detailLines.join('\n');

  // 終日予定としての dates パラメータ (YYYYMMDD/YYYYMMDD)
  // Googleカレンダーで終日予定にするには開始日と翌日（終了日）を指定
  const now = new Date();
  const formatYmd = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  const startDate = formatYmd(now);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const endDate = formatYmd(tomorrow);
  const dates = `${startDate}/${endDate}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    dates: dates
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * 安全に外部URLを新しいタブで開く (IPA / MDN Tabnabbing 対策 & URL検証)
 * - URLスキームとホスト名を厳格に検証（GoogleカレンダーのHTTPS URLのみ許可）
 * - Tabnabbing対策（noopener, noreferrer および window.opener = null）
 */
export function openSafeExternalUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'calendar.google.com') {
      console.warn('Blocked opening non-whitelisted external URL:', url);
      return;
    }
    const newWindow = window.open(parsed.href, '_blank', 'noopener,noreferrer');
    if (newWindow) {
      try {
        newWindow.opener = null;
      } catch {
        // Ignore cross-origin opener restriction in some browsers
      }
    }
  } catch {
    console.warn('Invalid URL provided:', url);
  }
}
