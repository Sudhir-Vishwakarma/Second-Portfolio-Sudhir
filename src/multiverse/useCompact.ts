// useCompact.ts — phone-sized overlay: narrow screens, and touch screens held upright
import { useEffect, useState } from 'react';

/** Keep in sync with the compact @media block in multiverse.css. */
export const COMPACT_QUERY = '(max-width: 767px), (orientation: portrait) and (pointer: coarse)';

const matches = () => typeof window.matchMedia === 'function' && window.matchMedia(COMPACT_QUERY).matches;

export function useCompact(): boolean {
  const [compact, setCompact] = useState(matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return compact;
}
