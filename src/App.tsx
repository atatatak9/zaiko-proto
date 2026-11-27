import { useState, useEffect, useMemo } from 'preact/hooks';
import { InventoryItem, NewItemInput } from './types';
import * as storage from './services/storage';
import { useRoute, navigateToDetail, navigateToList } from './router';

import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { ItemDetail } from './components/ItemDetail';
import { NewItemModal } from './components/NewItemModal';
import { BatchDateModal } from './components/BatchDateModal';

export function App() {
  const route = useRoute();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isBatchDateModalOpen, setIsBatchDateModalOpen] = useState(false);

  useEffect(() => {
    const loadedItems = storage.loadItems();
    const loadedLabels = storage.loadLabels();
    setItems(loadedItems);
    setLabels(loadedLabels);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2600);
  };

  // （最新の）購入日の古い順に固定ソート
  const sortedItems = useMemo(() => {
    const result = [...items];
    result.sort((a, b) => {
      const dateA = a.purchaseHistory[0]?.date || '';
      const dateB = b.purchaseHistory[0]?.date || '';
      if (!dateA && dateB) return 1; // 未記録は末尾
      if (dateA && !dateB) return -1;
      if (dateA !== dateB) return dateA.localeCompare(dateB); // 古い順 (昇順)
      return a.name.localeCompare(b.name, 'ja');
    });
    return result;
  }, [items]);

  // ラベルによるフィルタリング
  const filteredItems = useMemo(() => {
    if (selectedLabel === null) {
      return sortedItems;
    }
    if (selectedLabel === '__UNCLASSIFIED__') {
      return sortedItems.filter((i) => !i.label);
    }
    return sortedItems.filter((i) => i.label === selectedLabel);
  }, [sortedItems, selectedLabel]);

  // 現在アクティブなアイテム (URLハッシュから判定)
  const activeItem = useMemo(() => {
    if (route.view !== 'detail' || !route.itemId) return null;
    return items.find((i) => i.id === route.itemId) || null;
  }, [items, route]);

  // 存在しないアイテム詳細URLの場合は一覧へフォールバック
  useEffect(() => {
    if (route.view === 'detail' && items.length > 0 && !activeItem) {
      navigateToList();
    }
  }, [route, items, activeItem]);

  // アイテム選択 (詳細画面URLへ遷移)
  const handleSelectItem = (id: string) => {
    navigateToDetail(id);
  };

  // 一覧へ戻る (一覧URLへ遷移)
  const handleBackToList = () => {
    navigateToList();
  };

  // チェック操作
  const handleToggleCheck = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const isAll = sortedItems.length > 0 && sortedItems.every((i) => selectedIds.has(i.id));
    if (isAll) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      sortedItems.forEach((i) => next.add(i.id));
      setSelectedIds(next);
    }
  };

  // 複数アイテムに「指定日」を一括記録
  const handleBatchCustomDate = (date: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = storage.batchAddPurchaseDate(ids, date);
    setItems(storage.loadItems());
    setSelectedIds(new Set());
    showToast(`📅 ${count} 件の購入日 (${date}) を記録しました`);
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
    navigateToList();
    showToast(`「${created.name}」を追加しました`);
  };

  // 単一アイテム削除 (詳細画面の最下部から)
  const handleDeleteItem = (itemId: string) => {
    const target = items.find((i) => i.id === itemId);
    if (!confirm(`「${target?.name}」を削除しますか？`)) return;

    storage.deleteItem(itemId);
    const updated = storage.loadItems();
    setItems(updated);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
    navigateToList();
    showToast('アイテムを削除しました');
  };

  // ラベル追加
  const handleAddLabel = (name: string) => {
    const res = storage.addLabel(name);
    if (res.success) {
      setLabels(res.labels);
      showToast(`ラベル「${name}」を追加しました`);
    }
    return res;
  };

  // ラベル削除 (紐付くアイテムは未分類になる)
  const handleDeleteLabel = (name: string) => {
    if (
      !confirm(
        `ラベル「${name}」を削除しますか？\n（このラベルが設定されていたアイテムは「未分類」になります）`
      )
    ) {
      return;
    }
    const res = storage.deleteLabel(name);
    setLabels(res.labels);
    setItems(storage.loadItems());
    if (selectedLabel === name) {
      setSelectedLabel(null);
    }
    showToast(`ラベル「${name}」を削除しました`);
  };

  // アイテムのラベル更新
  const handleUpdateItemLabel = (itemId: string, label?: string) => {
    storage.updateItemLabel(itemId, label);
    setItems(storage.loadItems());
    showToast(label ? `ラベルを「${label}」に設定しました` : 'ラベルを解除しました');
  };

  // サンプルデータ復元
  const handleResetSample = () => {
    if (!confirm('初期サンプルデータにリセットしますか？')) return;
    const reset = storage.resetToSampleData();
    setItems(reset);
    setLabels(storage.loadLabels());
    setSelectedLabel(null);
    setSelectedIds(new Set());
    navigateToList();
    showToast('サンプルデータを復元しました');
  };

  return (
    <div id="app">
      <Header
        currentView={route.view}
        onBackToList={handleBackToList}
        onResetSample={handleResetSample}
      />

      {route.view === 'list' ? (
        <ItemList
          items={filteredItems}
          allItems={sortedItems}
          labels={labels}
          selectedLabel={selectedLabel}
          onSelectLabel={setSelectedLabel}
          selectedIds={selectedIds}
          onSelectItem={handleSelectItem}
          onToggleCheck={handleToggleCheck}
          onToggleSelectAll={handleToggleSelectAll}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenBatchDate={() => setIsBatchDateModalOpen(true)}
          onBatchDelete={handleBatchDelete}
        />
      ) : (
        activeItem && (
          <ItemDetail
            item={activeItem}
            labels={labels}
            onUpdateLabel={handleUpdateItemLabel}
            onAddLabel={handleAddLabel}
            onDeleteLabel={handleDeleteLabel}
            onDeleteRecord={handleDeleteRecord}
            onDeleteItem={handleDeleteItem}
          />
        )
      )}

      {/* Modals */}
      <NewItemModal
        isOpen={isNewModalOpen}
        labels={labels}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateNewItem}
        onAddLabel={handleAddLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      <BatchDateModal
        isOpen={isBatchDateModalOpen}
        selectedItems={items.filter((i) => selectedIds.has(i.id))}
        onClose={() => setIsBatchDateModalOpen(false)}
        onSubmit={handleBatchCustomDate}
      />

      {toastMessage && <div class="mobile-toast">{toastMessage}</div>}
    </div>
  );
}
