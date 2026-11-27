import { InventoryItem, PurchaseRecord, NewItemInput, DEFAULT_LABELS } from '../types';
import { getTodayString, isValidDateString } from '../utils/date';

const STORAGE_KEY = 'zaiko_minimal_items_v2';
const LABELS_STORAGE_KEY = 'zaiko_labels_v1';
const MAX_NAME_LENGTH = 100;
const MAX_LABEL_LENGTH = 30;

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
 * ラベル名のサニタイズ・入力値検証
 * - 前後空白の除去
 * - 制御文字の除去
 * - 最大30文字までの制限
 */
export function sanitizeLabel(label: string | undefined): string | undefined {
  if (!label || typeof label !== 'string') return undefined;
  const cleaned = label.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
  return cleaned ? cleaned.slice(0, MAX_LABEL_LENGTH) : undefined;
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
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
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
    (i.label === undefined ||
      (typeof i.label === 'string' && i.label.length <= MAX_LABEL_LENGTH)) &&
    Array.isArray(i.purchaseHistory) &&
    i.purchaseHistory.every(isValidPurchaseRecord) &&
    typeof i.createdAt === 'string' &&
    typeof i.updatedAt === 'string'
  );
}

/**
 * 初期サンプルデータ (アイテム名、ラベル、購入日)
 */
const SAMPLE_ITEMS: InventoryItem[] = [
  {
    id: 'item-1',
    name: 'トイレットペーパー',
    label: '洗濯・風呂・トイレ用品',
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
    label: 'キッチン用品',
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
    label: 'ストック食品',
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
    label: '洗濯・風呂・トイレ用品',
    purchaseHistory: [{ id: 'rec-4-1', date: '2026-09-10' }],
    createdAt: '2026-09-10T08:00:00Z',
    updatedAt: '2026-09-10T08:00:00Z'
  },
  {
    id: 'item-5',
    name: 'オリーブオイル',
    label: 'ストック食品',
    purchaseHistory: [{ id: 'rec-5-1', date: '2026-08-15' }],
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-15T14:00:00Z'
  },
  {
    id: 'item-6',
    name: '目薬',
    label: '一般使用品',
    purchaseHistory: [{ id: 'rec-6-1', date: '2026-09-25' }],
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
 * ラベル一覧の読み込み (未設定時は DEFAULT_LABELS を保存して返却)
 */
export function loadLabels(): string[] {
  try {
    const raw = localStorage.getItem(LABELS_STORAGE_KEY);
    if (!raw) {
      saveLabels([...DEFAULT_LABELS]);
      return [...DEFAULT_LABELS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_LABELS];
    }
    const valid = parsed
      .map(sanitizeLabel)
      .filter((l): l is string => typeof l === 'string' && l.length > 0);
    const unique = Array.from(new Set(valid));
    return unique.length > 0 ? unique : [...DEFAULT_LABELS];
  } catch {
    return [...DEFAULT_LABELS];
  }
}

/**
 * ラベル一覧の保存
 */
export function saveLabels(labels: readonly string[]): void {
  try {
    const unique = Array.from(
      new Set(
        labels.map(sanitizeLabel).filter((l): l is string => typeof l === 'string' && l.length > 0)
      )
    );
    localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(unique));
  } catch (err) {
    console.error('Failed to save labels to localStorage:', err);
  }
}

/**
 * 新規ラベルの追加
 */
export function addLabel(name: string): { success: boolean; labels: string[]; error?: string } {
  const safe = sanitizeLabel(name);
  if (!safe) {
    return { success: false, labels: loadLabels(), error: 'ラベル名を入力してください。' };
  }
  const current = loadLabels();
  if (current.includes(safe)) {
    return { success: false, labels: current, error: 'すでに同じ名前のラベルが存在します。' };
  }
  const next = [...current, safe];
  saveLabels(next);
  return { success: true, labels: next };
}

/**
 * ラベルの削除 (紐付いていたアイテムは未分類に自動更新)
 */
export function deleteLabel(name: string): { labels: string[]; affectedItemCount: number } {
  const current = loadLabels();
  const next = current.filter((l) => l !== name);
  saveLabels(next);

  const items = loadItems();
  let affected = 0;
  for (const item of items) {
    if (item.label === name) {
      item.label = undefined;
      item.updatedAt = new Date().toISOString();
      affected++;
    }
  }
  if (affected > 0) {
    saveItems(items);
  }
  return { labels: next, affectedItemCount: affected };
}

/**
 * アイテムのラベル更新
 */
export function updateItemLabel(itemId: string, label?: string): InventoryItem | null {
  const items = loadItems();
  const item = items.find((i) => i.id === itemId);
  if (!item) return null;

  item.label = sanitizeLabel(label);
  item.updatedAt = new Date().toISOString();
  saveItems(items);
  return item;
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
    label: sanitizeLabel(input.label),
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
  const items = loadItems().filter((item) => item.id !== id);
  saveItems(items);
}

/**
 * 複数アイテム一括削除
 */
export function deleteItems(ids: string[]): void {
  const idSet = new Set(ids);
  const items = loadItems().filter((item) => !idSet.has(item.id));
  saveItems(items);
}

/**
 * 単一アイテムに購入日を追加
 */
export function addPurchaseDate(
  itemId: string,
  date: string = getTodayString()
): PurchaseRecord | null {
  const items = loadItems();
  const item = items.find((i) => i.id === itemId);
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
  const item = items.find((i) => i.id === itemId);
  if (!item) return false;

  const originalLen = item.purchaseHistory.length;
  item.purchaseHistory = item.purchaseHistory.filter((r) => r.id !== recordId);
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
  saveLabels([...DEFAULT_LABELS]);
  return SAMPLE_ITEMS;
}
