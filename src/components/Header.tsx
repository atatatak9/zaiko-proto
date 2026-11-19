interface HeaderProps {
  currentView: 'list' | 'detail';
  onBackToList: () => void;
  onResetSample: () => void;
}

export function Header({
  currentView,
  onBackToList,
  onResetSample
}: HeaderProps) {
  if (currentView === 'detail') {
    return (
      <header class="mobile-appbar">
        <div class="appbar-left">
          <button
            class="btn-icon-mobile"
            onClick={onBackToList}
            title="一覧に戻る"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0 12px' }}
          >
            <span style={{ fontSize: '18px' }}>←</span>
            <span class="back-button-label" style={{ fontSize: '14.5px', fontWeight: 500 }}>一覧に戻る</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header class="mobile-appbar">
      <div class="appbar-left">
        <span class="appbar-title">
            <span>stocktake</span>
        </span>
      </div>

      {/* <div class="appbar-right">
        <button
          class="btn-icon-mobile"
          onClick={onResetSample}
          title="初期サンプルデータを復元"
        >
          🔄
        </button>
      </div> */}
    </header>
  );
}
