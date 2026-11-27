import { IconArrowLeft, IconPackage } from './Icons';

interface HeaderProps {
  currentView: 'list' | 'detail';
  onBackToList: () => void;
  onResetSample?: () => void;
}

export function Header({ currentView, onBackToList }: HeaderProps) {
  if (currentView === 'detail') {
    return (
      <header class="mobile-appbar">
        <div class="appbar-left">
          <button
            class="btn-icon-mobile"
            onClick={onBackToList}
            title="一覧に戻る"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              width: 'auto',
              padding: '0 12px'
            }}
          >
            <IconArrowLeft size={18} />
            <span class="back-button-label" style={{ fontSize: '14.5px', fontWeight: 500 }}>
              一覧に戻る
            </span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header class="mobile-appbar">
      <div class="appbar-left">
        <span class="appbar-title">
          <IconPackage size={22} color="var(--primary)" />
          <span>stocktake</span>
        </span>
      </div>
    </header>
  );
}
