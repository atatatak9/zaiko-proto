import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import htm from 'htm';
import { InventoryItem, FilterState, NewItemInput } from './types/index.js';
import * as storage from './services/storage.js';
import { getTodayString } from './utils/date.js';

import { Header } from './components/Header.js';
import { ItemList } from './components/ItemList.js';
import { ItemDetail } from './components/ItemDetail.js';
import { NewItemModal } from './components/NewItemModal.js';
import { BatchDateModal } from './components/BatchDateModal.js';

const html = htm.bind(h);

export function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    sortBy: 'lastPurchaseDesc'
  });

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBatchDateModalOpen, setIsBatchDateModalOpen] = useState(false);

  useEffect(() => {
    const loaded = storage.loadItems();
    setItems(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  // 検索とソート
  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (filter.sortBy === 'nameAsc') {
        return a.name.localeCompare(b.name, 'ja');
      }
      if (filter.sortBy === 'historyCountDesc') {
        return b.purchaseHistory.length - a.purchaseHistory.length;
      }
      const dateA = a.purchaseHistory[0]?.date || '';
      const dateB = b.purchaseHistory[0]?.date || '';
      if (filter.sortBy === 'lastPurchaseAsc') {
        if (!dateA) return 1;
        if (!dateB) return -1;
        return dateA.localeCompare(dateB);
      }
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.localeCompare(dateA);
    });

    return result;
  }, [items, filter]);

  const activeItem = useMemo(() => {
    return items.find(i => i.id === activeId) || null;
  }, [items, activeId]);

  // アイテム選択 (詳細画面へ遷移)
  const handleSelectItem = (id: string) => {
    setActiveId(id);
    setCurrentView('detail');
  };

  // 一覧へ戻る
  const handleBackToList = () => {
    setCurrentView('list');
  };

  // チェック操作
  const handleToggleCheck = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const isAll = filteredItems.length > 0 && filteredItems.every(i => selectedIds.has(i.id));
    if (isAll) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredItems.forEach(i => next.add(i.id));
      setSelectedIds(next);
    }
  };

  // 複数アイテムに「今日」を一括記録
  const handleBatchToday = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = storage.batchAddPurchaseDate(ids, getTodayString());
    setItems(storage.loadItems());
    setSelectedIds(new Set());
    showToast(`⚡ ${count} 件の購入日を今日で記録しました`);
  };

  // 複数アイテムに「指定日」を一括記録
  const handleBatchCustomDate = (date: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = storage.batchAddPurchaseDate(ids, date);
    setItems(storage.loadItems());
    setSelectedIds(new Set());
    showToast(`📅 ${count} 件の購入日 (${date}) を一括記録しました`);
  };

  // 複数アイテム一括削除
  const handleBatchDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`選択した ${ids.length} 件のアイテムを削除しますか？`)) return;

    storage.deleteItems(ids);
    const updated = storage.loadItems();
    setItems(updated);
    setSelectedIds(new Set());
    showToast(`${ids.length} 件のアイテムを削除しました`);
  };

  // 詳細画面からの今日記録
  const handleRecordToday = (itemId: string) => {
    storage.addPurchaseDate(itemId, getTodayString());
    setItems(storage.loadItems());
    const target = items.find(i => i.id === itemId);
    showToast(`⚡ 「${target?.name}」の購入日を今日で記録しました`);
  };

  // 詳細画面からの日付追加
  const handleAddDate = (itemId: string, date: string) => {
    storage.addPurchaseDate(itemId, date);
    setItems(storage.loadItems());
    showToast(`📅 購入日 (${date}) を追加しました`);
  };

  // 購入日履歴個別削除
  const handleDeleteRecord = (itemId: string, recordId: string) => {
    if (!confirm('この購入日を削除しますか？')) return;
    storage.deletePurchaseRecord(itemId, recordId);
    setItems(storage.loadItems());
    showToast('購入日を削除しました');
  };

  // アイテム新規追加
  const handleCreateNewItem = (input: NewItemInput) => {
    const created = storage.addItem(input);
    const updated = storage.loadItems();
    setItems(updated);
    setActiveId(created.id);
    setCurrentView('detail');
    showToast(`「${created.name}」を追加しました`);
  };

  // 単一アイテム削除
  const handleDeleteItem = (itemId: string) => {
    const target = items.find(i => i.id === itemId);
    if (!confirm(`「${target?.name}」を削除しますか？`)) return;

    storage.deleteItem(itemId);
    const updated = storage.loadItems();
    setItems(updated);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    setCurrentView('list');
    showToast('アイテムを削除しました');
  };

  // サンプルデータ復元
  const handleResetSample = () => {
    if (!confirm('初期サンプルデータにリセットしますか？')) return;
    const reset = storage.resetToSampleData();
    setItems(reset);
    setSelectedIds(new Set());
    setActiveId(null);
    setCurrentView('list');
    showToast('サンプルデータを復元しました');
  };

  return html`
    <div id="app">
      <${Header}
        currentView=${currentView}
        activeItemName=${activeItem?.name}
        onBackToList=${handleBackToList}
        onResetSample=${handleResetSample}
        onDeleteItem=${currentView === 'detail' && activeItem ? () => handleDeleteItem(activeItem.id) : undefined}
      />

      ${currentView === 'list' ? html`
        <${ItemList}
          items=${filteredItems}
          selectedIds=${selectedIds}
          searchQuery=${filter.searchQuery}
          sortBy=${filter.sortBy}
          onSearchChange=${(q: string) => setFilter(prev => ({ ...prev, searchQuery: q }))}
          onSortChange=${(sortBy: FilterState['sortBy']) => setFilter(prev => ({ ...prev, sortBy }))}
          onSelectItem=${handleSelectItem}
          onToggleCheck=${handleToggleCheck}
          onToggleSelectAll=${handleToggleSelectAll}
          onOpenNewModal=${() => setIsNewModalOpen(true)}
          onBatchToday=${handleBatchToday}
          onOpenBatchDate=${() => setIsBatchDateModalOpen(true)}
          onBatchDelete=${handleBatchDelete}
        />
      ` : html`
        ${activeItem && html`
          <${ItemDetail}
            item=${activeItem}
            onRecordToday=${handleRecordToday}
            onAddDate=${handleAddDate}
            onDeleteRecord=${handleDeleteRecord}
            onDeleteItem=${handleDeleteItem}
          />
        `}
      `}

      <!-- Modals (Bottom Sheets) -->
      <${NewItemModal}
        isOpen=${isNewModalOpen}
        onClose=${() => setIsNewModalOpen(false)}
        onSubmit=${handleCreateNewItem}
      />

      <${BatchDateModal}
        isOpen=${isBatchDateModalOpen}
        selectedItems=${items.filter(i => selectedIds.has(i.id))}
        onClose=${() => setIsBatchDateModalOpen(false)}
        onSubmit=${handleBatchCustomDate}
      />

      ${toastMessage && html`
        <div class="mobile-toast">
          ${toastMessage}
        </div>
      `}
    </div>
  `;
}
