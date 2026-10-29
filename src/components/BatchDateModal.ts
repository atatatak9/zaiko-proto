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
      <div class="bottom-sheet" onClick=${(e: MouseEvent) => e.stopPropagation()}>
        <div class="sheet-header">
          <span class="sheet-title">日付を指定して一括記録</span>
          <button
            class="btn-icon-mobile"
            style="width: 32px; height: 32px;"
            onClick=${onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit=${handleSubmit}>
          <div class="sheet-body">
            <div style="font-size: 13.5px; color: var(--text-secondary);">
              選択した <strong>${selectedItems.length} 件</strong> のアイテムに購入日をまとめて記録します。
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 6px; max-height: 90px; overflow-y: auto; padding: 6px; background-color: #f8f9fa; border-radius: 8px;">
              ${selectedItems.map(item => html`
                <span style="font-size: 11.5px; background: #e8f0fe; color: #1967d2; padding: 3px 8px; border-radius: 4px; font-weight: 500;">
                  ${item.name}
                </span>
              `)}
            </div>

            <div>
              <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">
                購入日 *
              </label>
              <input
                type="date"
                class="input-mobile"
                value=${date}
                required
                onInput=${(e: any) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div class="sheet-footer">
            <button
              type="button"
              class="btn-sheet-secondary"
              onClick=${onClose}
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn-sheet-primary"
            >
              一括記録する
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
