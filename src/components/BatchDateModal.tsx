import { useState } from 'preact/hooks';
import { InventoryItem } from '../types';
import { getTodayString, isValidDateString } from '../utils/date';

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
    if (!isValidDateString(date)) return;
    onSubmit(date);
    onClose();
  };

  return (
    <div class="modal-overlay" onClick={onClose}>
      <div class="bottom-sheet" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <div class="sheet-header">
          <span class="sheet-title">購入日を記録</span>
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
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              選択した <strong>{selectedItems.length} 件</strong> のアイテムに購入日を記録します。
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '90px', overflowY: 'auto', padding: '6px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              {selectedItems.map(item => (
                <span
                  key={item.id}
                  style={{ fontSize: '11.5px', background: '#e8f0fe', color: '#1967d2', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}
                >
                  {item.name}
                </span>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                購入日 *
              </label>
              <input
                type="date"
                class="input-mobile"
                value={date}
                required
                onInput={(e) => setDate((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          <div class="sheet-footer">
            <button
              type="submit"
              class="btn-sheet-primary"
            >
              記録する
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
