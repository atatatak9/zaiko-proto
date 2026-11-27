import { useState } from 'preact/hooks';
import { InventoryItem, isDefaultLabel } from '../types';
import { formatDate, getRelativeDateString } from '../utils/date';

interface ItemDetailProps {
  item: InventoryItem;
  labels: string[];
  onUpdateLabel: (itemId: string, label?: string) => void;
  onAddLabel: (name: string) => { success: boolean; labels?: string[]; error?: string };
  onDeleteLabel: (name: string) => void;
  onDeleteRecord: (id: string, recordId: string) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemDetail({
  item,
  labels,
  onUpdateLabel,
  onAddLabel,
  onDeleteLabel,
  onDeleteRecord,
  onDeleteItem
}: ItemDetailProps) {
  const [isLabelEditorOpen, setIsLabelEditorOpen] = useState(false);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [labelError, setLabelError] = useState<string | null>(null);

  const handleSelectLabel = (label: string) => {
    if (item.label === label) {
      // 選択中のものを再タップした場合は解除
      onUpdateLabel(item.id, undefined);
    } else {
      onUpdateLabel(item.id, label);
    }
  };

  const handleClearLabel = () => {
    onUpdateLabel(item.id, undefined);
  };

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
    onUpdateLabel(item.id, trimmed);
    setNewLabelInput('');
    setLabelError(null);
    setIsAddingLabel(false);
  };

  const handleDeleteLabelClick = (e: MouseEvent, label: string) => {
    e.stopPropagation();
    onDeleteLabel(label);
  };

  return (
    <div class="detail-view">
      <div class="detail-view-content">
        {/* Title & Label Card */}
        <div class="detail-title-card">
          <h1 class="detail-item-title">{item.name}</h1>

          {/* Current Label Display & Edit Trigger */}
          <div class="detail-label-section">
            <div class="detail-label-row">
              {item.label ? (
                <div class="detail-current-label">
                  <span class="detail-label-badge">🏷️ {item.label}</span>
                  <button
                    type="button"
                    class="btn-label-edit"
                    onClick={() => setIsLabelEditorOpen(!isLabelEditorOpen)}
                  >
                    {isLabelEditorOpen ? '閉じる' : '変更'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  class="btn-label-add-empty"
                  onClick={() => setIsLabelEditorOpen(!isLabelEditorOpen)}
                >
                  ＋ ラベルを設定
                </button>
              )}
            </div>

            {/* Label Selector Panel */}
            {isLabelEditorOpen && (
              <div class="detail-label-editor-panel">
                <div class="label-editor-header">
                  <span class="label-editor-title">ラベルを選択</span>
                  {item.label && (
                    <button type="button" class="btn-text-clear" onClick={handleClearLabel}>
                      ラベルを解除
                    </button>
                  )}
                </div>

                <div class="label-chips-group">
                  {labels.map((label) => {
                    const isSelected = item.label === label;
                    const isCustom = !isDefaultLabel(label);
                    return (
                      <div
                        key={label}
                        class={`label-select-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectLabel(label)}
                        role="button"
                        tabIndex={0}
                      >
                        <span class="chip-text">🏷️ {label}</span>
                        {isCustom && (
                          <button
                            type="button"
                            class="chip-delete-btn"
                            title={`ラベル「${label}」を削除`}
                            onClick={(e: MouseEvent) => handleDeleteLabelClick(e, label)}
                          >
                            ✕
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
                      ＋ 新しいラベル
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
            )}
          </div>
        </div>

        {/* History Block */}
        <div class="history-block">
          <div class="history-header-row">
            <span class="history-heading">購入日履歴</span>
          </div>

          {/* History Timeline Cards */}
          {item.purchaseHistory.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                background: '#fafafa',
                borderRadius: '8px'
              }}
            >
              購入日履歴はまだありません。
            </div>
          ) : (
            <div class="history-timeline-mobile">
              {item.purchaseHistory.map((record) => (
                <div key={record.id} class="history-card-mobile">
                  <div class="history-card-left">
                    <span class="history-card-date">{formatDate(record.date)}</span>
                    <span class="history-card-rel">{getRelativeDateString(record.date)}</span>
                  </div>
                  <button
                    class="btn-del-record-mobile"
                    title="この記録を削除"
                    onClick={() => onDeleteRecord(item.id, record.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div class="danger-zone">
          <button class="btn-delete-item-full" onClick={() => onDeleteItem(item.id)}>
            🗑️ このアイテムを削除
          </button>
        </div>
      </div>
    </div>
  );
}
