import { InventoryItem, PurchaseRecord, NewItemInput } from '../types';
import { getTodayString } from '../utils/date';

const STORAGE_KEY = 'zaiko_minimal_items_v2';

/**
 * 初期サンプルデータ (アイテム名と購入日のみ)
 */
const SAMPLE_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'トイレットペーパー',
    purchaseHistory: [
      { id: 'rec-1-1', date: '2026-10-24' },
      { id: 'rec-1-2', date: '2026-09-28' },
      { id: 'rec-1-3', date: '2026-09-02' }
    ],
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-10-24T10:00:00Z'
  },
  {
    id: 'item-2',
    name: '食器用洗剤',
    purchaseHistory: [
      { id: 'rec-2-1', date: '2026-10-18' },
      { id: 'rec-2-2', date: '2026-08-30' }
    ],
    createdAt: '2026-08-30T11:00:00Z',
    updatedAt: '2026-10-18T16:20:00Z'
  },
  {
    id: 'item-3',
    name: 'コーヒー豆',
    purchaseHistory: [
      { id: 'rec-3-1', date: '2026-10-10' },
      { id: 'rec-3-2', date: '2026-09-15' },
      { id: 'rec-3-3', date: '2026-08-20' }
    ],
    createdAt: '2026-08-20T17:00:00Z',
    updatedAt: '2026-10-10T12:00:00Z'
  },
  {
    id: 'item-4',
    name: '洗濯洗剤',
    purchaseHistory: [
      { id: 'rec-4-1', date: '2026-09-10' }
    ],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z'
  },
  {
    id: 'item-5',
    name: 'オリーブオイル',
    purchaseHistory: [
      { id: 'rec-5-1', date: '2026-08-15' }
    ],
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-15T14:00:00Z'
  },
  {
    id: 'item-6',
    name: '目薬',
    purchaseHistory: [
      { id: 'rec-6-1', date: '2026-09-25' }
    ],
    createdAt: '2026-09-25T19:00:00Z',
    updatedAt: '2026-09-25T19:00:00Z'
  }
];

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveItems(SAMPLE_ITEMS);
      return SAMPLE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SAMPLE_ITEMS;
  } catch {
    return SAMPLE_ITEMS;
  }
}

export function saveItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * 新規アイテム追加
 */
export function addItem(input: NewItemInput): InventoryItem {
  const items = loadItems();
  const now = new Date().toISOString();
  const history: PurchaseRecord[] = [];

  if (input.initialPurchaseDate) {
    history.push({
      id: generateId(),
      date: input.initialPurchaseDate
    });
  }

  const newItem: InventoryItem = {
    id: generateId(),
    name: input.name.trim(),
    purchaseHistory: history,
    createdAt: now,
    updatedAt: now
  };

  items.unshift(newItem);
  saveItems(items);
  return newItem;
}

/**
 * アイテム削除
 */
export function deleteItem(id: string): void {
  const items = loadItems().filter(item => item.id !== id);
  saveItems(items);
}

/**
 * 複数アイテム一括削除
 */
export function deleteItems(ids: string[]): void {
  const idSet = new Set(ids);
  const items = loadItems().filter(item => !idSet.has(item.id));
  saveItems(items);
}

/**
 * 単一アイテムに購入日を追加
 */
export function addPurchaseDate(itemId: string, date: string = getTodayString()): PurchaseRecord | null {
  const items = loadItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  const newRecord: PurchaseRecord = {
    id: generateId(),
    date
  };

  item.purchaseHistory.unshift(newRecord);
  item.purchaseHistory.sort((a, b) => b.date.localeCompare(a.date));
  item.updatedAt = new Date().toISOString();

  saveItems(items);
  return newRecord;
}

/**
 * 複数アイテムにまとめて購入日を追加 (一括購入記録)
 */
export function batchAddPurchaseDate(itemIds: string[], date: string = getTodayString()): number {
  if (itemIds.length === 0) return 0;
  const idSet = new Set(itemIds);
  const items = loadItems();
  const now = new Date().toISOString();
  let count = 0;

  for (const item of items) {
    if (idSet.has(item.id)) {
      item.purchaseHistory.unshift({
        id: generateId(),
        date
      });
      item.purchaseHistory.sort((a, b) => b.date.localeCompare(a.date));
      item.updatedAt = now;
      count++;
    }
  }

  if (count > 0) {
    saveItems(items);
  }
  return count;
}

/**
 * 購入日履歴の個別削除
 */
export function deletePurchaseRecord(itemId: string, recordId: string): boolean {
  const items = loadItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return false;

  const originalLen = item.purchaseHistory.length;
  item.purchaseHistory = item.purchaseHistory.filter(r => r.id !== recordId);
  if (item.purchaseHistory.length !== originalLen) {
    item.updatedAt = new Date().toISOString();
    saveItems(items);
    return true;
  }
  return false;
}

/**
 * サンプルデータへリセット
 */
export function resetToSampleData(): InventoryItem[] {
  saveItems(SAMPLE_ITEMS);
  return SAMPLE_ITEMS;
}
