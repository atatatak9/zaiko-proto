import { InventoryItem } from '../types';
import { formatDate, getRelativeDateString } from '../utils/date';

interface ItemDetailProps {
  item: InventoryItem;
  onDeleteRecord: (id: string, recordId: string) => void;
  onDeleteItem: (id: string) => void;
}

export function ItemDetail({
  item,
  onDeleteRecord,
  onDeleteItem
}: ItemDetailProps) {
  return (
    <div class="detail-view">
      <div class="detail-view-content">
        {/* Title */}
        <div class="detail-title-card">
          <h1 class="detail-item-title">{item.name}</h1>
        </div>

        {/* History Block */}
        <div class="history-block">
          <div class="history-header-row">
            <span class="history-heading">購入日履歴</span>
          </div>

          {/* History Timeline Cards */}
          {item.purchaseHistory.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: '#fafafa', borderRadius: '8px' }}>
              購入日履歴はまだありません。
            </div>
          ) : (
            <div class="history-timeline-mobile">
              {item.purchaseHistory.map(record => (
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
          <button
            class="btn-delete-item-full"
            onClick={() => onDeleteItem(item.id)}
          >
            🗑️ このアイテムを削除
          </button>
        </div>
      </div>
    </div>
  );
}
