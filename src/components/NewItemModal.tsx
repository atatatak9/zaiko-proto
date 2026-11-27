import { useState } from 'preact/hooks';
import { NewItemInput, isDefaultLabel } from '../types';
import { getTodayString } from '../utils/date';
import { IconPlus, IconTag, IconX } from './Icons';

interface NewItemModalProps {
  isOpen: boolean;
  labels: string[];
  onClose: () => void;
  onSubmit: (input: NewItemInput) => void;
  onAddLabel: (name: string) => { success: boolean; labels?: string[]; error?: string };
  onDeleteLabel: (name: string) => void;
}

export function NewItemModal({
  isOpen,
  labels,
  onClose,
  onSubmit,
  onAddLabel,
  onDeleteLabel
}: NewItemModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(undefined);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [labelError, setLabelError] = useState<string | null>(null);

  const [recordInitial, setRecordInitial] = useState(true);
  const [purchaseDate, setPurchaseDate] = useState(getTodayString());

  const handleAddNewLabel = (e?: Event) => {
    if (e) e.preventDefault();
    const trimmed = newLabelInput.trim();
    if (!trimmed) {
      setLabelError('ラベル名を入力してください');
      return;
    }
    const res = onAddLabel(trimmed);
    if (!res.success) {
      setLabelError(res.error || 'ラベルの追加に失敗しました');
      return;
    }
    setSelectedLabel(trimmed);
    setNewLabelInput('');
    setLabelError(null);
    setIsAddingLabel(false);
  };

  const handleDeleteLabelClick = (e: MouseEvent, label: string) => {
    e.stopPropagation();
    onDeleteLabel(label);
    if (selectedLabel === label) {
      setSelectedLabel(undefined);
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) return;

    onSubmit({
      name: trimmed,
      label: selectedLabel,
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
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="sheet-body">
            <div>
              <label
                style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}
              >
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

            {/* Label Selection */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}
              >
                <label style={{ fontSize: '13px', fontWeight: 600 }}>ラベル (任意)</label>
                {selectedLabel && (
                  <button
                    type="button"
                    class="btn-text-clear"
                    onClick={() => setSelectedLabel(undefined)}
                  >
                    選択解除
                  </button>
                )}
              </div>

              <div class="label-chips-group">
                {labels.map((label) => {
                  const isSelected = selectedLabel === label;
                  const isCustom = !isDefaultLabel(label);
                  return (
                    <div
                      key={label}
                      class={`label-select-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedLabel(isSelected ? undefined : label)}
                      role="button"
                      tabIndex={0}
                    >
                      <span class="chip-text">
                        <IconTag size={12} style={{ marginRight: '4px' }} />
                        {label}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          class="chip-delete-btn"
                          title={`ラベル「${label}」を削除`}
                          onClick={(e: MouseEvent) => handleDeleteLabelClick(e, label)}
                        >
                          <IconX size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {!isAddingLabel && (
                  <button
                    type="button"
                    class="label-add-trigger-btn"
                    onClick={() => {
                      setIsAddingLabel(true);
                      setLabelError(null);
                    }}
                  >
                    <IconPlus size={14} style={{ marginRight: '4px' }} />
                    新しいラベル
                  </button>
                )}
              </div>

              {isAddingLabel && (
                <div class="inline-add-label-box">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      class="input-mobile"
                      style={{ height: '36px', fontSize: '13.5px', flex: 1 }}
                      placeholder="新しいラベル名 (最大30文字)"
                      maxLength={30}
                      value={newLabelInput}
                      autoFocus
                      onInput={(e) => {
                        setNewLabelInput((e.target as HTMLInputElement).value);
                        setLabelError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewLabel();
                        }
                      }}
                    />
                    <button type="button" class="btn-inline-submit" onClick={handleAddNewLabel}>
                      追加
                    </button>
                    <button
                      type="button"
                      class="btn-inline-cancel"
                      onClick={() => {
                        setIsAddingLabel(false);
                        setNewLabelInput('');
                        setLabelError(null);
                      }}
                    >
                      キャンセル
                    </button>
                  </div>
                  {labelError && (
                    <div style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>
                      {labelError}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
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
            <button type="submit" class="btn-sheet-primary">
              追加する
            </button>
            <button type="button" class="btn-sheet-secondary" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
