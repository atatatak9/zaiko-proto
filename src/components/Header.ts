import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

interface HeaderProps {
  currentView: 'list' | 'detail';
  activeItemName?: string;
  onBackToList: () => void;
  onResetSample: () => void;
  onDeleteItem?: () => void;
}

export function Header({
  currentView,
  activeItemName,
  onBackToList,
  onResetSample,
  onDeleteItem
}: HeaderProps) {
  if (currentView === 'detail') {
    return html`
      <header class="mobile-appbar">
        <div class="appbar-left">
          <button class="btn-icon-mobile" onClick=${onBackToList} title="一覧に戻る">
            ←
          </button>
          <span class="appbar-title" style="font-size: 16.5px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${activeItemName || 'アイテム詳細'}
          </span>
        </div>
        <div class="appbar-right">
          ${onDeleteItem && html`
            <button
              class="btn-icon-mobile"
              style="color: var(--danger);"
              onClick=${onDeleteItem}
              title="このアイテムを削除"
            >
              🗑️
            </button>
          `}
        </div>
      </header>
    `;
  }

  return html`
    <header class="mobile-appbar">
      <div class="appbar-left">
        <span class="appbar-title">
          <span>✉️</span>
          <span>Zaiko</span>
        </span>
      </div>

      <div class="appbar-right">
        <button
          class="btn-icon-mobile"
          onClick=${onResetSample}
          title="初期サンプルデータを復元"
        >
          🔄
        </button>
      </div>
    </header>
  `;
}
