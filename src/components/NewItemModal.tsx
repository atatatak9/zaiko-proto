import { useState } from 'preact/hooks';
import { NewItemInput } from '../types';
import { getTodayString } from '../utils/date';

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
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) return;

    onSubmit({
      name: trimmed,
      initialPurchaseDate: recordInitial ? purchaseDate : undefined
    });

    onClose();
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="bottom-sheet" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <div class="sheet-header">
          <span class="sheet-title">アイテムを追加</span>
          <button
            class="btn-icon-mobile"
            style={{ width: '32px', height: '32px' }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="sheet-body">
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                アイテム名 *
              </label>
              <input
                type="text"
                class="input-mobile"
                placeholder="例: シャンプー、コーヒー豆"
                value={name}
                maxLength={100}
                required
                autoFocus
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
              />
            </div>

            <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  class="checkbox-mobile"
                  checked={recordInitial}
                  onChange={(e) => setRecordInitial((e.target as HTMLInputElement).checked)}
                />
                <span>初回の購入日も記録する</span>
              </label>

              {recordInitial && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="date"
                    class="input-mobile"
                    value={purchaseDate}
                    onInput={(e) => setPurchaseDate((e.target as HTMLInputElement).value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div class="sheet-footer">
            <button
              type="submit"
              class="btn-sheet-primary"
            >
              追加する
            </button>
            <button
              type="button"
              class="btn-sheet-secondary"
              onClick={onClose}
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
