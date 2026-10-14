import { useCallback, useState } from 'react';

export type ViewMode = 'orbit' | 'list';
type ViewStore = Pick<Storage, 'getItem' | 'setItem'>;

const storageKey = (id: string) => `mb-view-${id}`;

function browserStorage(): ViewStore | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readViewMode(id: string, store: ViewStore | null = browserStorage()): ViewMode {
  try {
    return store && store.getItem(storageKey(id)) === 'list' ? 'list' : 'orbit';
  } catch {
    return 'orbit';
  }
}

export function writeViewMode(id: string, mode: ViewMode, store: ViewStore | null = browserStorage()): void {
  try {
    store?.setItem(storageKey(id), mode);
  } catch {
    // Blocked storage (private mode, policy): the choice just isn't remembered.
  }
}

/** Orbit | List choice for one section, remembered per visitor when storage allows. */
export function useViewMode(id: string): [ViewMode, (mode: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => readViewMode(id));
  const choose = useCallback(
    (next: ViewMode) => {
      setMode(next);
      writeViewMode(id, next);
    },
    [id]
  );
  return [mode, choose];
}
