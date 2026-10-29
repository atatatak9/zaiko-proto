import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';
import { InventoryItem } from '../types/index.js';
import { getTodayString } from '../utils/date.js';

const html = htm.bind(h);

interface BatchDateModalProps {
  isOpen: boolean;
  selectedItems: InventoryItem[];
  onClose: () => void;
  onSubmit: (date: string) => void;
}

export function BatchDateModal({
  isOpen,
  selectedItems,
  onClose,
  onSubmit
}: BatchDateModalProps) {
  if (!isOpen) return null;

  const [date, setDate] = useState(getTodayString());

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!date) return;
    onSubmit(date);
    onClose();
  };

  return html`
    <div class="modal-overlay" onClick=${onClose}>
      <div class="modal-box" onClick=${(e: MouseEvent) => e.stopPropagation()}>
        <div class="modal-header">
          <span>日付を指定して一括記録</span>
          <button
            style="background: transparent; border: none; cursor: pointer; font-size: 16px;"
            onClick=${onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit=${handleSubmit}>
          <div class="modal-body">
            <div style="font-size: 13px; color: var(--text-secondary);">
              選択した <strong>${selectedItems.length} 件</strong> のアイテムに購入日をまとめて記録します。
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 80px; overflow-y: auto;">
              ${selectedItems.map(item => html`
                <span style="font-size: 11px; background: #e8f0fe; color: #1967d2; padding: 2px 6px; border-radius: 4px;">
                  ${item.name}
                </span>
              `)}
            </div>

            <div>
              <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 6px;">
                購入日 *
              </label>
              <input
                type="date"
                class="form-input"
                value=${date}
                required
                onInput=${(e: any) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-detail" onClick=${onClose}>
              キャンセル
            </button>
            <button type="submit" class="btn-detail btn-detail-primary">
              一括記録
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
