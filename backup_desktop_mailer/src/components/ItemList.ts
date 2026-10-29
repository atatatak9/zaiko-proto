import { h } from 'preact';
import htm from 'htm';
import { InventoryItem, FilterState } from '../types/index.js';
import { getRelativeDateString } from '../utils/date.js';

const html = htm.bind(h);

interface ItemListProps {
  items: InventoryItem[];
  selectedIds: Set<string>;
  activeId: string | null;
  filter: FilterState;
  onSelectItem: (id: string) => void;
  onToggleCheck: (id: string, checked: boolean) => void;
  onToggleSelectAll: () => void;
  onBatchToday: () => void;
  onOpenBatchDate: () => void;
  onBatchDelete: () => void;
  onSortChange: (sort: FilterState['sortBy']) => void;
}

export function ItemList({
  items,
  selectedIds,
  activeId,
  filter,
  onSelectItem,
  onToggleCheck,
  onToggleSelectAll,
  onBatchToday,
  onOpenBatchDate,
  onBatchDelete,
  onSortChange
}: ItemListProps) {
  const isAllSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
  const hasSelection = selectedIds.size > 0;

  return html`
    <section class="list-pane">
      <!-- Mailer-style Toolbar -->
      <div class="toolbar-mailer">
        <div class="toolbar-actions">
          <input
            type="checkbox"
            class="item-checkbox"
            checked=${isAllSelected}
            onChange=${onToggleSelectAll}
            title=${isAllSelected ? '全選択を解除' : 'すべて選択'}
          />

          ${hasSelection ? html`
            <span style="font-size: 12px; font-weight: 600; color: var(--primary); margin: 0 4px;">
              ${selectedIds.size} 件
            </span>

            <button
              class="btn-tool btn-tool-primary"
              onClick=${onBatchToday}
              title="選択したアイテムの購入日を今日として一括記録"
            >
              <span>⚡ 今日購入</span>
            </button>

            <button
              class="btn-tool"
              onClick=${onOpenBatchDate}
              title="日付を指定して一括記録"
            >
              <span>📅 日付指定...</span>
            </button>

            <button
              class="btn-tool"
              style="color: var(--danger);"
              onClick=${onBatchDelete}
              title="選択したアイテムを削除"
            >
              <span>🗑️ 削除</span>
            </button>
          ` : html`
            <span style="font-size: 12px; color: var(--text-secondary); margin-left: 6px;">
              ${items.length} 件
            </span>
          `}
        </div>

        <div>
          <select
            class="sort-select"
            value=${filter.sortBy}
            onChange=${(e: any) => onSortChange(e.target.value)}
          >
            <option value="lastPurchaseDesc">購入日: 新しい順</option>
            <option value="lastPurchaseAsc">購入日: 古い順</option>
            <option value="nameAsc">名前順</option>
            <option value="historyCountDesc">購入回数順</option>
          </select>
        </div>
      </div>

      <!-- Item Rows -->
      <div class="items-scroll">
        ${items.length === 0 ? html`
          <div style="padding: 40px 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
            アイテムがありません
          </div>
        ` : items.map(item => {
          const isChecked = selectedIds.has(item.id);
          const isActive = item.id === activeId;
          const latest = item.purchaseHistory[0];
          const relDate = latest ? getRelativeDateString(latest.date) : '未購入';
          const isToday = relDate === '今日';

          return html`
            <div
              key=${item.id}
              class="item-row ${isChecked ? 'selected' : ''} ${isActive ? 'active' : ''}"
              onClick=${() => onSelectItem(item.id)}
            >
              <div onClick=${(e: MouseEvent) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  class="item-checkbox"
                  checked=${isChecked}
                  onChange=${(e: any) => onToggleCheck(item.id, e.target.checked)}
                />
              </div>

              <div class="item-info">
                <span class="item-name" title=${item.name}>${item.name}</span>
                <div class="item-dates-meta">
                  <span class="date-relative ${isToday ? 'today' : ''}">
                    ${relDate}
                  </span>
                  <span class="count-chip">${item.purchaseHistory.length}回</span>
                </div>
              </div>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
