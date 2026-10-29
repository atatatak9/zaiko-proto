import { h } from 'preact';
import htm from 'htm';

const html = htm.bind(h);

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewModal: () => void;
  onResetSample: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  onOpenNewModal,
  onResetSample
}: HeaderProps) {
  return html`
    <header class="app-header">
      <div class="brand">
        <span>✉️</span>
        <span>Zaiko</span>
      </div>

      <div class="search-box">
        <span style="color: var(--text-muted); font-size: 14px;">🔍</span>
        <input
          type="text"
          class="search-input"
          placeholder="アイテムを検索..."
          value=${searchQuery}
          onInput=${(e: any) => onSearchChange(e.target.value)}
        />
        ${searchQuery && html`
          <button
            style="background: transparent; border: none; cursor: pointer; color: var(--text-muted);"
            onClick=${() => onSearchChange('')}
          >
            ✕
          </button>
        `}
      </div>

      <div class="header-right">
        <button
          class="btn-tool"
          onClick=${onResetSample}
          title="初期サンプルデータを復元"
        >
          <span>🔄</span>
          <span>サンプル</span>
        </button>

        <button class="btn-add-item" onClick=${onOpenNewModal}>
          <span>＋</span>
          <span>アイテム追加</span>
        </button>
      </div>
    </header>
  `;
}
