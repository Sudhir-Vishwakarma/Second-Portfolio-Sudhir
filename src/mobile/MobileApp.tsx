import React, { useCallback, useLayoutEffect, useState } from 'react';
import { MobileSectionId } from './sections';
import { UNIVERSE_ORDER, nextIndex, prevIndex, universeForHash } from './universePager';
import { useUniversePager } from './useUniversePager';
import { useReducedMotion } from './useReducedMotion';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SpaceCanvas } from './SpaceCanvas';
import { UniverseView } from './UniverseView';
import './mobile.css';

const MobileApp: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [initial] = useState(() => universeForHash(window.location.hash));
  const pager = useUniversePager(initial ? initial.index : 0, reducedMotion);
  const { travelTo, index } = pager;

  // Layout effects run before the pager's passive mount effect.
  useLayoutEffect(() => {
    // index.css smooth-scrolls <html> for the classic site; mobile jumps must be instant.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    // A reload or Forward onto a stale sheet entry would leave mbSheet set with no sheet open.
    if (window.history.state && window.history.state.mbSheet) window.history.replaceState(null, '');
    return () => {
      root.style.scrollBehavior = prevBehavior;
    };
  }, []);

  const onTravel = useCallback(
    (dir: 'next' | 'prev', source: 'button' | 'gesture') => travelTo(dir === 'next' ? nextIndex(index) : prevIndex(index), { source }),
    [travelTo, index]
  );
  const onSelect = useCallback((id: MobileSectionId) => travelTo(UNIVERSE_ORDER.indexOf(id)), [travelTo]);

  return (
    <div className={`mb mb--pager${reducedMotion ? ' is-reduced' : ''}`}>
      <SpaceCanvas reducedMotion={reducedMotion} warpRef={pager.warpRef} />
      <TopBar onHome={() => travelTo(0)} />
      <UniverseView
        key={index}
        index={index}
        state={pager.viewState}
        anchor={pager.arrivals === 0 && initial ? initial.anchor : null}
        focusHeading={pager.arrivals > 0}
        onTravel={onTravel}
      />
      <BottomNav active={UNIVERSE_ORDER[index]} onSelect={onSelect} />
    </div>
  );
};

export default MobileApp;
