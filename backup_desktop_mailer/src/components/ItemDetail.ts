import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';
import { InventoryItem } from '../types/index.js';
import { formatDate, getRelativeDateString, getTodayString } from '../utils/date.js';

const html = htm.bind(h);

interface ItemDetailProps {
  item: InventoryItem | null;
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

  if (!item) {
    return html`
      <main class="detail-pane">
        <div class="detail-empty">
          <span style="font-size: 32px;">✉️</span>
          <div>アイテムを選択してください</div>
        </div>
      </main>
    `;
  }

  const latest = item.purchaseHistory[0];

  const handleAddSubmit = (e: Event) => {
    e.preventDefault();
    if (!inputDate) return;
    onAddDate(item.id, inputDate);
    setShowAddInput(false);
  };

  return html`
    <main class="detail-pane">
      <div class="detail-header">
        <h2 class="detail-title">${item.name}</h2>
        <div class="detail-top-actions">
          <button
            class="btn-detail btn-detail-primary"
            onClick=${() => onRecordToday(item.id)}
            title="今日を購入日として記録"
          >
            <span>⚡ 今日購入を記録</span>
          </button>
          <button
            class="btn-detail"
            onClick=${() => setShowAddInput(!showAddInput)}
            title="日付を指定して履歴を追加"
          >
            <span>📅 日付を追加</span>
          </button>
          <button
            class="btn-detail"
            style="color: var(--danger); border-color: #fad2cf;"
            onClick=${() => onDeleteItem(item.id)}
            title="このアイテムを削除"
          >
            <span>🗑️ 削除</span>
          </button>
        </div>
      </div>

      <div class="detail-content">
        <!-- Status Banner -->
        <div class="status-banner">
          <div>
            <div class="status-label">最新の購入日</div>
            <div class="status-value">
              ${latest ? `${formatDate(latest.date)} (${getRelativeDateString(latest.date)})` : '未記録'}
            </div>
          </div>
          <div>
            <div class="status-label">記録された購入回数</div>
            <div class="status-value" style="text-align: right;">
              ${item.purchaseHistory.length} 回
            </div>
          </div>
        </div>

        <!-- Add Date Inline Form -->
        ${showAddInput && html`
          <form class="add-date-box" onSubmit=${handleAddSubmit}>
            <span style="font-size: 13px; font-weight: 500;">購入日を追加:</span>
            <input
              type="date"
              class="input-date"
              value=${inputDate}
              required
              onInput=${(e: any) => setInputDate(e.target.value)}
            />
            <button
              type="submit"
              class="btn-detail btn-detail-primary"
              style="padding: 5px 12px;"
            >
              追加
            </button>
            <button
              type="button"
              class="btn-detail"
              style="padding: 5px 10px;"
              onClick=${() => setShowAddInput(false)}
            >
              キャンセル
            </button>
          </form>
        `}

        <!-- History List -->
        <div>
          <div class="history-title-row">
            <span class="history-heading">購入日履歴</span>
          </div>

          ${item.purchaseHistory.length === 0 ? html`
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
              購入履歴はまだありません。「⚡ 今日購入を記録」を押して記録できます。
            </div>
          ` : html`
            <div class="history-list">
              ${item.purchaseHistory.map(record => html`
                <div key=${record.id} class="history-row">
                  <div>
                    <span class="history-date">${formatDate(record.date)}</span>
                    <span class="history-rel">${getRelativeDateString(record.date)}</span>
                  </div>
                  <button
                    class="btn-del-date"
                    title="この購入日を削除"
                    onClick=${() => onDeleteRecord(item.id, record.id)}
                  >
                    ✕
                  </button>
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    </main>
  `;
}
