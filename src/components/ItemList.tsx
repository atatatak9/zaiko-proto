import { useState } from 'preact/hooks';
import { InventoryItem } from '../types';
import { getRelativeDateString } from '../utils/date';
import { getGoogleCalendarUrl, createGoogleCalendarEventUrl } from '../utils/calendar';

interface ItemListProps {
  items: InventoryItem[];
  selectedIds: Set<string>;
  onSelectItem: (id: string) => void;
  onToggleCheck: (id: string, checked: boolean) => void;
  onToggleSelectAll: () => void;
  onOpenNewModal: () => void;
  onBatchToday: () => void;
  onOpenBatchDate: () => void;
  onBatchDelete: () => void;
}

export function ItemList({
  items,
  selectedIds,
  onSelectItem,
  onToggleCheck,
  onToggleSelectAll,
  onOpenNewModal,
  onBatchToday,
  onOpenBatchDate,
  onBatchDelete
}: ItemListProps) {
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const isAllSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
  const hasSelection = selectedIds.size > 0;
  const selectedItems = items.filter(i => selectedIds.has(i.id));

  const handleOpenCalendar = () => {
    setIsCalendarMenuOpen(false);
    window.open(getGoogleCalendarUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleAddCalendarEvent = () => {
    setIsCalendarMenuOpen(false);
    const url = createGoogleCalendarEventUrl(selectedItems);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div class="view-container">
      {/* Subheader: Select all & Order note */}
      <div class="list-subheader">
        <label class="select-all-label">
          <input
            type="checkbox"
            class="checkbox-mobile"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
          />
          <span>{hasSelection ? `${selectedIds.size} 件選択中` : `すべて (${items.length})`}</span>
        </label>

        <span class="order-label-mobile">購入日の古い順</span>
      </div>

      {/* Scrollable List */}
      <div class="items-list-scroll">
        {items.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>アイテムがありません</div>
            <div style={{ fontSize: '12.5px', marginTop: '4px' }}>右下のボタンから追加してください</div>
          </div>
        ) : (
          items.map(item => {
            const isChecked = selectedIds.has(item.id);
            const latest = item.purchaseHistory[0];
            const relDate = latest ? getRelativeDateString(latest.date) : '未購入';
            const isToday = relDate === '今日';

            return (
              <div
                key={item.id}
                class={`mobile-item-card ${isChecked ? 'checked' : ''}`}
                onClick={() => onSelectItem(item.id)}
              >
                {/* Checkbox */}
                <div
                  class="item-check-hitarea"
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    onToggleCheck(item.id, !isChecked);
                  }}
                >
                  <input
                    type="checkbox"
                    class="checkbox-mobile"
                    checked={isChecked}
                    readOnly
                  />
                </div>

                {/* Main Card Body */}
                <div class="item-card-main">
                  <div class="item-card-row-top">
                    <span class="item-card-title">{item.name}</span>
                    <span class={`item-card-date ${isToday ? 'is-today' : ''}`}>
                      {relDate}
                    </span>
                  </div>
                  <div class="item-card-sub">
                    {latest ? (
                      <span>最終購入日: {latest.date}</span>
                    ) : (
                      <span>購入日未記録</span>
                    )}
                  </div>
                </div>

                <span class="item-card-arrow">›</span>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {!hasSelection && (
        <button class="fab-add" onClick={onOpenNewModal}>
          <span style={{ fontSize: '20px' }}>＋</span>
          <span>アイテム追加</span>
        </button>
      )}

      {/* Bottom Batch Action Bar */}
      {hasSelection && (
        <>
          {isCalendarMenuOpen && (
            <>
              <div
                class="calendar-menu-backdrop"
                onClick={() => setIsCalendarMenuOpen(false)}
              />
              <div class="calendar-menu-popover">
                <div class="calendar-menu-header">Google カレンダー</div>
                <button
                  class="calendar-menu-item"
                  onClick={handleAddCalendarEvent}
                  title="選択したアイテムの購入予定日をカレンダーに追加"
                >
                  <span class="calendar-menu-icon">➕</span>
                  <div class="calendar-menu-text">
                    <div class="calendar-menu-title">次回購入予定日を追加</div>
                    <div class="calendar-menu-desc">{selectedItems.length}件のアイテム予定を作成</div>
                  </div>
                </button>
                <button
                  class="calendar-menu-item"
                  onClick={handleOpenCalendar}
                  title="Googleカレンダーを開く"
                >
                  <span class="calendar-menu-icon">📅</span>
                  <div class="calendar-menu-text">
                    <div class="calendar-menu-title">Googleカレンダーを開く</div>
                    <div class="calendar-menu-desc">カレンダーのトップページ</div>
                  </div>
                </button>
              </div>
            </>
          )}

          <div class="bottom-batch-bar">
            <span class="batch-count-badge">
              <span>{selectedIds.size}</span>
              <span>件</span>
              <span class="badge-suffix">選択中</span>
            </span>

            <div class="batch-actions-group">
              <button
                class="btn-batch-action primary"
                onClick={onBatchToday}
                title="今日購入として記録"
              >
                <span>⚡ 今日</span>
              </button>

              <button
                class="btn-batch-action"
                onClick={onOpenBatchDate}
                title="日付を指定して記録"
              >
                <span>📅 日付</span>
              </button>

              <button
                class={`btn-batch-action ${isCalendarMenuOpen ? 'active' : ''}`}
                onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
                title="Googleカレンダー連携メニュー"
              >
                <span>🗓️ カレンダー</span>
              </button>

              <button
                class="btn-batch-action danger"
                onClick={onBatchDelete}
                title="選択したアイテムを削除"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
