import { h } from 'preact';
import { useState } from 'preact/hooks';
import htm from 'htm';
import { NewItemInput } from '../types/index.js';
import { getTodayString } from '../utils/date.js';

const html = htm.bind(h);

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: NewItemInput) => void;
}

export function NewItemModal({
  isOpen,
  onClose,
  onSubmit
}: NewItemModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [recordInitial, setRecordInitial] = useState(true);
  const [purchaseDate, setPurchaseDate] = useState(getTodayString());

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      initialPurchaseDate: recordInitial ? purchaseDate : undefined
    });

    onClose();
  };

  return html`
    <div class="modal-overlay" onClick=${onClose}>
      <div class="bottom-sheet" onClick=${(e: MouseEvent) => e.stopPropagation()}>
        <div class="sheet-header">
          <span class="sheet-title">新規アイテムを追加</span>
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
            <div>
              <label style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px;">
                アイテム名 *
              </label>
              <input
                type="text"
                class="input-mobile"
                placeholder="例: シャンプー、コーヒー豆"
                value=${name}
                required
                autoFocus
                onInput=${(e: any) => setName(e.target.value)}
              />
            </div>

            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 12px; border: 1px solid var(--border-color);">
              <label style="display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; cursor: pointer;">
                <input
                  type="checkbox"
                  class="checkbox-mobile"
                  checked=${recordInitial}
                  onChange=${(e: any) => setRecordInitial(e.target.checked)}
                />
                <span>初回の購入日も記録する</span>
              </label>

              ${recordInitial && html`
                <div style="margin-top: 10px;">
                  <input
                    type="date"
                    class="input-mobile"
                    value=${purchaseDate}
                    onInput=${(e: any) => setPurchaseDate(e.target.value)}
                  />
                </div>
              `}
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
              追加する
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
