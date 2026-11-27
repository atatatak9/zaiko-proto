/**
 * 購入日記録
 */
export interface PurchaseRecord {
  id: string; // 記録ID
  date: string; // 購入日 (YYYY-MM-DD)
}

/**
 * デフォルトのサンプルラベル
 */
export const DEFAULT_LABELS = [
  'ストック食品',
  'キッチン用品',
  '洗濯・風呂・トイレ用品',
  '一般使用品',
  '育児用品'
] as const;

export type DefaultLabel = (typeof DEFAULT_LABELS)[number];

/**
 * デフォルトラベル判定ヘルパー
 */
export function isDefaultLabel(label: string): label is DefaultLabel {
  return (DEFAULT_LABELS as readonly string[]).includes(label);
}

/**
 * アイテム (アイテム名、ラベル、購入日履歴)
 */
export interface InventoryItem {
  id: string; // アイテムID
  name: string; // アイテム名
  label?: string; // ラベル（カテゴリ）
  purchaseHistory: PurchaseRecord[]; // 購入日履歴 (新しい順)
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}

/**
 * アイテム新規作成入力
 */
export interface NewItemInput {
  name: string;
  label?: string;
  initialPurchaseDate?: string; // 任意 (今日または指定日)
}
