import { InventoryItem, PurchaseRecord, NewItemInput } from '../types';
import { getTodayString, isValidDateString } from '../utils/date';

const STORAGE_KEY = 'zaiko_minimal_items_v2';
const MAX_NAME_LENGTH = 100;

/**
 * アイテム名のサニタイズ・入力値検証 (IPA 入力値サニタイズ)
 * - 前後空白の除去
 * - 制御文字 (ASCII 0-31, 127-159) の除去
 * - 最大100文字までの制限 (DoS / LocalStorage 枯渇防止)
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  const cleaned = name.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  return cleaned.slice(0, MAX_NAME_LENGTH);
}

/**
 * 暗号学的に安全なランダム ID 生成 (MDN セキュア実装ガイド)
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * LocalStorage データの型・スキーマ検証 (クライアント側データの整合性保護)
 */
function isValidPurchaseRecord(rec: unknown): rec is PurchaseRecord {
  if (!rec || typeof rec !== 'object') return false;
  const r = rec as Record<string, unknown>;
  return typeof r.id === 'string' && typeof r.date === 'string' && isValidDateString(r.date);
}

function isValidInventoryItem(item: unknown): item is InventoryItem {
  if (!item || typeof item !== 'object') return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.id === 'string' &&
    typeof i.name === 'string' &&
    i.name.trim().length > 0 &&
    i.name.length <= MAX_NAME_LENGTH &&
    Array.isArray(i.purchaseHistory) &&
    i.purchaseHistory.every(isValidPurchaseRecord) &&
    typeof i.createdAt === 'string' &&
    typeof i.updatedAt === 'string'
  );
}

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

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveItems(SAMPLE_ITEMS);
      return SAMPLE_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SAMPLE_ITEMS;
    }
    const valid = parsed.filter(isValidInventoryItem);
    return valid.length > 0 ? valid : SAMPLE_ITEMS;
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
  const safeName = sanitizeName(input.name);

  if (input.initialPurchaseDate && isValidDateString(input.initialPurchaseDate)) {
    history.push({
      id: generateId(),
      date: input.initialPurchaseDate
    });
  }

  const newItem: InventoryItem = {
    id: generateId(),
    name: safeName || '無題アイテム',
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

  const safeDate = isValidDateString(date) ? date : getTodayString();
  const newRecord: PurchaseRecord = {
    id: generateId(),
    date: safeDate
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
  const safeDate = isValidDateString(date) ? date : getTodayString();
  let count = 0;

  for (const item of items) {
    if (idSet.has(item.id)) {
      item.purchaseHistory.unshift({
        id: generateId(),
        date: safeDate
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
