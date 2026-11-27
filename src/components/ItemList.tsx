import { useState } from 'preact/hooks';
import { InventoryItem } from '../types';
import { getRelativeDateString } from '../utils/date';
import {
  getGoogleCalendarUrl,
  createGoogleCalendarEventUrl,
  openSafeExternalUrl
} from '../utils/calendar';
import {
  IconCalendar,
  IconCalendarPlus,
  IconChevronRight,
  IconInbox,
  IconPenLine,
  IconPlus,
  IconTag,
  IconTrash2,
  IconX
} from './Icons';

interface ItemListProps {
  items: InventoryItem[];
  allItems: InventoryItem[];
  labels: string[];
  selectedLabel: string | null;
  onSelectLabel: (label: string | null) => void;
  selectedIds: Set<string>;
  onSelectItem: (id: string) => void;
  onToggleCheck: (id: string, checked: boolean) => void;
  onToggleSelectAll: () => void;
  onOpenNewModal: () => void;
  onOpenBatchDate: () => void;
  onBatchDelete: () => void;
}

export function ItemList({
  items,
  allItems,
  labels,
  selectedLabel,
  onSelectLabel,
  selectedIds,
  onSelectItem,
  onToggleCheck,
  onToggleSelectAll,
  onOpenNewModal,
  onOpenBatchDate,
  onBatchDelete
}: ItemListProps) {
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const isAllSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const hasSelection = selectedIds.size > 0;
  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  // 未分類アイテムのカウント
  const unclassifiedCount = allItems.filter((i) => !i.label).length;
  const hasUnclassified = unclassifiedCount > 0;

  const handleOpenCalendar = () => {
    setIsCalendarMenuOpen(false);
    openSafeExternalUrl(getGoogleCalendarUrl());
  };

  const handleAddCalendarEvent = () => {
    setIsCalendarMenuOpen(false);
    const url = createGoogleCalendarEventUrl(selectedItems);
    openSafeExternalUrl(url);
  };

  return (
    <div class="view-container">
      {/* Label Filter Chips Bar */}
      <div class="label-filter-container">
        <div class="label-filter-scroll" role="tablist" aria-label="ラベル別フィルター">
          {labels.map((label) => {
            const count = allItems.filter((i) => i.label === label).length;
            const isSelected = selectedLabel === label;
            return (
              <button
                key={label}
                type="button"
                class={`label-filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectLabel(isSelected ? null : label)}
                aria-pressed={isSelected}
              >
                <span>{label}</span>
                <span class="chip-count">{count}</span>
                {isSelected && <IconX size={12} style={{ marginLeft: '2px', opacity: 0.9 }} />}
              </button>
            );
          })}
          {hasUnclassified && (
            <button
              type="button"
              class={`label-filter-chip ${selectedLabel === '__UNCLASSIFIED__' ? 'active' : ''}`}
              onClick={() =>
                onSelectLabel(selectedLabel === '__UNCLASSIFIED__' ? null : '__UNCLASSIFIED__')
              }
              aria-pressed={selectedLabel === '__UNCLASSIFIED__'}
            >
              <span>未分類</span>
              <span class="chip-count">{unclassifiedCount}</span>
              {selectedLabel === '__UNCLASSIFIED__' && (
                <IconX size={12} style={{ marginLeft: '2px', opacity: 0.9 }} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Subheader: Select all & Order note */}
      <div class="list-subheader">
        <label class="select-all-label">
          <input
            type="checkbox"
            class="checkbox-mobile"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
          />
          <span>
            {hasSelection
              ? `${selectedIds.size} 件選択中`
              : selectedLabel
                ? `絞り込み結果 (${items.length})`
                : `すべて (${items.length})`}
          </span>
        </label>

        <span class="order-label-mobile">購入日の古い順</span>
      </div>

      {/* Scrollable List */}
      <div class="items-list-scroll">
        {items.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
              <IconInbox size={36} strokeWidth={1.75} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>
              {selectedLabel ? 'このラベルのアイテムはありません' : 'アイテムがありません'}
            </div>
            {!selectedLabel && (
              <div style={{ fontSize: '12.5px', marginTop: '6px' }}>
                右下の＋ボタンから追加してください
              </div>
            )}
          </div>
        ) : (
          items.map((item) => {
            const isChecked = selectedIds.has(item.id);
            const latest = item.purchaseHistory[0];
            const relDate = latest ? getRelativeDateString(latest.date) : '';
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
                  <input type="checkbox" class="checkbox-mobile" checked={isChecked} readOnly />
                </div>

                {/* Main Card Body */}
                <div class="item-card-main">
                  <div class="item-card-row-top">
                    <span class="item-card-title">{item.name}</span>
                    {relDate && (
                      <span class={`item-card-date ${isToday ? 'is-today' : ''}`}>{relDate}</span>
                    )}
                  </div>
                  <div class="item-card-sub">
                    {item.label && (
                      <span class="item-card-label">
                        <IconTag size={11} style={{ marginRight: '3px' }} />
                        {item.label}
                      </span>
                    )}
                    <span>最終購入日: {latest ? latest.date : ''}</span>
                  </div>
                </div>

                <span class="item-card-arrow">
                  <IconChevronRight size={18} />
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {!hasSelection && (
        <button
          class="fab-add"
          onClick={onOpenNewModal}
          title="アイテムを追加する"
          aria-label="アイテムを追加する"
        >
          <IconPlus size={22} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom Batch Action Bar */}
      {hasSelection && (
        <>
          {isCalendarMenuOpen && (
            <>
              <div class="calendar-menu-backdrop" onClick={() => setIsCalendarMenuOpen(false)} />
              <div class="calendar-menu-popover">
                <div class="calendar-menu-header">Googleカレンダー連携</div>
                <button
                  class="calendar-menu-item"
                  onClick={handleAddCalendarEvent}
                  title="選択したアイテムの購入予定日をカレンダーに追加する"
                >
                  <span
                    class="calendar-menu-icon"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconCalendarPlus size={20} color="var(--primary)" />
                  </span>
                  <div class="calendar-menu-text">
                    <div class="calendar-menu-title">次回購入予定日を追加する</div>
                    <div class="calendar-menu-desc">
                      {selectedItems.length}件のアイテム予定を作成
                    </div>
                  </div>
                </button>
                <button
                  class="calendar-menu-item"
                  onClick={handleOpenCalendar}
                  title="Googleカレンダーを開く"
                >
                  <span
                    class="calendar-menu-icon"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconCalendar size={20} color="var(--primary)" />
                  </span>
                  <div class="calendar-menu-text">
                    <div class="calendar-menu-title">Googleカレンダーを開く</div>
                    <div class="calendar-menu-desc">カレンダーのトップページ</div>
                  </div>
                </button>
              </div>
            </>
          )}

          <div class="bottom-batch-bar" role="toolbar" aria-label="選択中アイテムの一括操作">
            <button
              class="btn-batch-action"
              onClick={onOpenBatchDate}
              title="購入日を記録する"
              aria-label="購入日を記録する"
            >
              <IconPenLine size={20} />
            </button>

            <button
              class={`btn-batch-action ${isCalendarMenuOpen ? 'active' : ''}`}
              onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
              title="Googleカレンダー連携メニューを開く"
              aria-label="Googleカレンダー連携メニューを開く"
            >
              <IconCalendar size={20} />
            </button>

            <button
              class="btn-batch-action danger"
              onClick={onBatchDelete}
              title="選択したアイテムを削除する"
              aria-label="選択したアイテムを削除する"
            >
              <IconTrash2 size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
