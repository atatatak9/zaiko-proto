import { h } from 'preact';
import htm from 'htm';
import { InventoryItem, FilterState } from '../types/index.js';
import { getRelativeDateString } from '../utils/date.js';

const html = htm.bind(h);

interface ItemListProps {
  items: InventoryItem[];
  selectedIds: Set<string>;
  searchQuery: string;
  sortBy: FilterState['sortBy'];
  onSearchChange: (q: string) => void;
  onSortChange: (sort: FilterState['sortBy']) => void;
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
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  onSelectItem,
  onToggleCheck,
  onToggleSelectAll,
  onOpenNewModal,
  onBatchToday,
  onOpenBatchDate,
  onBatchDelete
}: ItemListProps) {
  const isAllSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
  const hasSelection = selectedIds.size > 0;

  return html`
    <div class="view-container">
      <!-- Search Bar -->
      <div class="mobile-search-strip">
        <div class="search-pill">
          <span style="color: var(--text-muted); font-size: 15px;">🔍</span>
          <input
            type="text"
            class="search-pill-input"
            placeholder="アイテムを検索..."
            value=${searchQuery}
            onInput=${(e: any) => onSearchChange(e.target.value)}
          />
          ${searchQuery && html`
            <button
              style="background: transparent; border: none; font-size: 14px; color: var(--text-muted); cursor: pointer;"
              onClick=${() => onSearchChange('')}
            >
              ✕
            </button>
          `}
        </div>
      </div>

      <!-- Subheader: Select all & Sort -->
      <div class="list-subheader">
        <label class="select-all-label">
          <input
            type="checkbox"
            class="checkbox-mobile"
            checked=${isAllSelected}
            onChange=${onToggleSelectAll}
          />
          <span>${hasSelection ? `${selectedIds.size} 件選択中` : `すべて (${items.length})`}</span>
        </label>

        <select
          class="sort-select-mobile"
          value=${sortBy}
          onChange=${(e: any) => onSortChange(e.target.value)}
        >
          <option value="lastPurchaseDesc">購入日: 新しい順</option>
          <option value="lastPurchaseAsc">購入日: 古い順</option>
          <option value="nameAsc">名前順</option>
          <option value="historyCountDesc">購入回数順</option>
        </select>
      </div>

      <!-- Scrollable List -->
      <div class="items-list-scroll">
        ${items.length === 0 ? html`
          <div style="padding: 60px 20px; text-align: center; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">📭</div>
            <div style="font-size: 15px; font-weight: 500;">アイテムがありません</div>
            <div style="font-size: 12.5px; margin-top: 4px;">右下のボタンから追加してください</div>
          </div>
        ` : items.map(item => {
          const isChecked = selectedIds.has(item.id);
          const latest = item.purchaseHistory[0];
          const relDate = latest ? getRelativeDateString(latest.date) : '未購入';
          const isToday = relDate === '今日';

          return html`
            <div
              key=${item.id}
              class="mobile-item-card ${isChecked ? 'checked' : ''}"
              onClick=${() => onSelectItem(item.id)}
            >
              <!-- Checkbox (Hit area enlarged) -->
              <div
                class="item-check-hitarea"
                onClick=${(e: MouseEvent) => {
                  e.stopPropagation();
                  onToggleCheck(item.id, !isChecked);
                }}
              >
                <input
                  type="checkbox"
                  class="checkbox-mobile"
                  checked=${isChecked}
                  readOnly
                />
              </div>

              <!-- Main Card Body -->
              <div class="item-card-main">
                <div class="item-card-row-top">
                  <span class="item-card-title">${item.name}</span>
                  <span class="item-card-date ${isToday ? 'is-today' : ''}">
                    ${relDate}
                  </span>
                </div>
                <div class="item-card-sub">
                  <span class="chip-history-count">${item.purchaseHistory.length}回購入</span>
                  ${latest ? html`<span>最終: ${latest.date}</span>` : null}
                </div>
              </div>

              <span class="item-card-arrow">›</span>
            </div>
          `;
        })}
      </div>

      <!-- Floating Action Button (FAB) -->
      ${!hasSelection && html`
        <button class="fab-add" onClick=${onOpenNewModal}>
          <span style="font-size: 20px;">＋</span>
          <span>アイテム追加</span>
        </button>
      `}

      <!-- Bottom Batch Action Bar (Appears when items are checked) -->
      ${hasSelection && html`
        <div class="bottom-batch-bar">
          <span class="batch-count-badge">
            ${selectedIds.size} 件選択中
          </span>

          <div class="batch-actions-group">
            <button
              class="btn-batch-action primary"
              onClick=${onBatchToday}
              title="今日購入として記録"
            >
              <span>⚡ 今日</span>
            </button>

            <button
              class="btn-batch-action"
              onClick=${onOpenBatchDate}
              title="日付を指定して記録"
            >
              <span>📅 日付</span>
            </button>

            <button
              class="btn-batch-action danger"
              onClick=${onBatchDelete}
              title="選択したアイテムを削除"
            >
              <span>🗑️</span>
            </button>
          </div>
        </div>
      `}
    </div>
  `;
}
