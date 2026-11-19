/**
 * 購入日記録
 */
export interface PurchaseRecord {
  id: string;   // 記録ID
  date: string; // 購入日 (YYYY-MM-DD)
}

/**
 * アイテム (アイテム名と購入日履歴のみ)
 */
export interface InventoryItem {
  id: string;                         // アイテムID
  name: string;                       // アイテム名
  purchaseHistory: PurchaseRecord[];  // 購入日履歴 (新しい順)
  createdAt: string;                  // 作成日時
  updatedAt: string;                  // 更新日時
}

/**
 * アイテム新規作成入力
 */
export interface NewItemInput {
  name: string;
  initialPurchaseDate?: string; // 任意 (今日または指定日)
}
