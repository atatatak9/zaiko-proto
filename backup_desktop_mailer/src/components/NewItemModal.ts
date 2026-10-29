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
      <div class="modal-box" onClick=${(e: MouseEvent) => e.stopPropagation()}>
        <div class="modal-header">
          <span>アイテムを追加</span>
          <button
            style="background: transparent; border: none; cursor: pointer; font-size: 16px;"
            onClick=${onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit=${handleSubmit}>
          <div class="modal-body">
            <div>
              <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 6px;">
                アイテム名 *
              </label>
              <input
                type="text"
                class="form-input"
                placeholder="例: シャンプー、コーヒー豆"
                value=${name}
                required
                autoFocus
                onInput=${(e: any) => setName(e.target.value)}
              />
            </div>

            <div style="padding: 10px; background: #f8f9fa; border-radius: 6px; border: 1px solid var(--border-light);">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer;">
                <input
                  type="checkbox"
                  class="item-checkbox"
                  checked=${recordInitial}
                  onChange=${(e: any) => setRecordInitial(e.target.checked)}
                />
                <span>初回の購入日も記録する</span>
              </label>

              ${recordInitial && html`
                <div style="margin-top: 8px;">
                  <input
                    type="date"
                    class="form-input"
                    value=${purchaseDate}
                    onInput=${(e: any) => setPurchaseDate(e.target.value)}
                  />
                </div>
              `}
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn-detail"
              onClick=${onClose}
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn-detail btn-detail-primary"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
