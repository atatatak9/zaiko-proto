import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';
import { InventoryItem } from '../types/index.js';
import { formatDate, getRelativeDateString, getTodayString } from '../utils/date.js';

const html = htm.bind(h);

interface ItemDetailProps {
  item: InventoryItem;
  onRecordToday: (id: string) => void;
  onAddDate: (id: string, date: string) => void;
  onDeleteRecord: (id: string, recordId: string) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemDetail({
  item,
  onRecordToday,
  onAddDate,
  onDeleteRecord,
  onDeleteItem
}: ItemDetailProps) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [inputDate, setInputDate] = useState(getTodayString());

  const latest = item.purchaseHistory[0];

  const handleAddSubmit = (e: Event) => {
    e.preventDefault();
    if (!inputDate) return;
    onAddDate(item.id, inputDate);
    setShowAddInput(false);
  };

  return html`
    <div class="detail-view">
      <div class="detail-view-content">
        <!-- Title & Status -->
        <div class="detail-title-card">
          <h1 class="detail-item-title">${item.name}</h1>
        </div>

        <!-- Status Highlight Box -->
        <div class="status-highlight-box">
          <div>
            <div class="status-highlight-label">最新の購入日</div>
            <div class="status-highlight-value">
              ${latest ? `${formatDate(latest.date)} (${getRelativeDateString(latest.date)})` : '未記録'}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="status-highlight-label">購入回数</div>
            <div class="status-highlight-value">
              ${item.purchaseHistory.length} 回
            </div>
          </div>
        </div>

        <!-- Big Thumb Action Button -->
        <button
          class="btn-today-big"
          onClick=${() => onRecordToday(item.id)}
        >
          <span style="font-size: 18px;">⚡</span>
          <span>今日購入を記録する</span>
        </button>

        <!-- History Block -->
        <div class="history-block">
          <div class="history-header-row">
            <span class="history-heading">購入日履歴</span>
            <button
              class="btn-add-past-date"
              onClick=${() => setShowAddInput(!showAddInput)}
            >
              ${showAddInput ? '閉じる' : '＋ 過去の日付を追加'}
            </button>
          </div>

          <!-- Add Past Date Expandable Form -->
          ${showAddInput && html`
            <form class="mobile-add-date-form" onSubmit=${handleAddSubmit}>
              <span style="font-size: 13px; font-weight: 600; color: var(--primary);">
                購入日を指定して追加:
              </span>
              <input
                type="date"
                class="input-mobile"
                value=${inputDate}
                required
                onInput=${(e: any) => setInputDate(e.target.value)}
              />
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button
                  type="button"
                  class="btn-sheet-secondary"
                  style="flex: none; padding: 8px 14px; font-size: 13px;"
                  onClick=${() => setShowAddInput(false)}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  class="btn-sheet-primary"
                  style="flex: none; padding: 8px 16px; font-size: 13px;"
                >
                  追加
                </button>
              </div>
            </form>
          `}

          <!-- History Timeline Cards -->
          ${item.purchaseHistory.length === 0 ? html`
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; background: #fafafa; border-radius: 8px;">
              購入日履歴がまだありません。上のボタンから今日購入を記録できます。
            </div>
          ` : html`
            <div class="history-timeline-mobile">
              ${item.purchaseHistory.map(record => html`
                <div key=${record.id} class="history-card-mobile">
                  <div class="history-card-left">
                    <span class="history-card-date">${formatDate(record.date)}</span>
                    <span class="history-card-rel">${getRelativeDateString(record.date)}</span>
                  </div>
                  <button
                    class="btn-del-record-mobile"
                    title="この記録を削除"
                    onClick=${() => onDeleteRecord(item.id, record.id)}
                  >
                    ✕
                  </button>
                </div>
              `)}
            </div>
          `}
        </div>

        <!-- Danger Zone -->
        <div class="danger-zone">
          <button
            class="btn-delete-item-full"
            onClick=${() => onDeleteItem(item.id)}
          >
            🗑️ このアイテムを削除
          </button>
        </div>
      </div>
    </div>
  `;
}
