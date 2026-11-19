import { useState, useEffect } from 'preact/hooks';

export interface RouteState {
  view: 'list' | 'detail';
  itemId: string | null;
}

/**
 * 現在のURLハッシュからルート情報を解析
 */
export function parseRoute(): RouteState {
  const hash = window.location.hash || '#/';
  const match = hash.match(/^#\/items\/([^/?#]+)/);
  if (match) {
    return {
      view: 'detail',
      itemId: decodeURIComponent(match[1])
    };
  }
  return {
    view: 'list',
    itemId: null
  };
}

/**
 * ハッシュURLを更新して遷移
 */
export function navigate(path: string): void {
  const targetHash = path.startsWith('#') ? path : `#${path}`;
  if (window.location.hash !== targetHash) {
    window.location.hash = targetHash;
  }
}

/**
 * 一覧画面へ遷移
 */
export function navigateToList(): void {
  navigate('#/');
}

/**
 * アイテム詳細画面へ遷移
 */
export function navigateToDetail(itemId: string): void {
  navigate(`#/items/${encodeURIComponent(itemId)}`);
}

/**
 * ルート監視用カスタムフック（ブラウザの「戻る」「進む」に連動）
 */
export function useRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(() => parseRoute());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return route;
}
