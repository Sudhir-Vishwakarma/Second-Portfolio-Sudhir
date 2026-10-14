import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MobileSectionId } from './sections';
import { UNIVERSE_ORDER, nextIndex, prevIndex, universeForHash } from './universePager';
import { useUniversePager } from './useUniversePager';
import { useReducedMotion } from './useReducedMotion';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SpaceCanvas } from './SpaceCanvas';
import { UniverseView } from './UniverseView';
import { Sheet, closeTopSheet } from './Sheet';
import { MultiverseMap } from './map/MultiverseMap';
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
    // Keep the browser's pull-to-refresh from beating the "pull for previous universe" gesture.
    const body = document.body;
    const prevRootOverscroll = root.style.overscrollBehaviorY;
    const prevBodyOverscroll = body.style.overscrollBehaviorY;
    root.style.overscrollBehaviorY = 'none';
    body.style.overscrollBehaviorY = 'none';
    // A reload or Forward onto a stale sheet entry would leave mbSheet set with no sheet open.
    if (window.history.state && window.history.state.mbSheet) window.history.replaceState(null, '');
    return () => {
      root.style.scrollBehavior = prevBehavior;
      root.style.overscrollBehaviorY = prevRootOverscroll;
      body.style.overscrollBehaviorY = prevBodyOverscroll;
    };
  }, []);

  const onTravel = useCallback(
    (dir: 'next' | 'prev', source: 'button' | 'gesture') => travelTo(dir === 'next' ? nextIndex(index) : prevIndex(index), { source }),
    [travelTo, index]
  );
  const onSelect = useCallback((id: MobileSectionId) => travelTo(UNIVERSE_ORDER.indexOf(id)), [travelTo]);

  const [mapOpen, setMapOpen] = useState(false);
  // Universe picked on the map. Travel starts only after the map's sheet has closed AND left the DOM:
  // the pager ignores non-history travel while a .mb-sheet is mounted.
  const mapTarget = useRef<number | null>(null);
  const mapClosing = useRef(false);
  const closeMap = useCallback(() => setMapOpen(false), []);
  useEffect(() => {
    if (mapOpen) return;
    mapClosing.current = false;
    const target = mapTarget.current;
    mapTarget.current = null;
    if (target !== null) travelTo(target, { via: 'map' });
  }, [mapOpen, travelTo]);
  const onPick = useCallback(
    (i: number) => {
      if (mapClosing.current) return; // a second tap while the map is closing must not go Back twice
      mapClosing.current = true;
      mapTarget.current = i === index ? null : i;
      closeTopSheet(closeMap);
    },
    [index, closeMap]
  );

  return (
    <div className={`mb mb--pager${reducedMotion ? ' is-reduced' : ''}`}>
      <SpaceCanvas reducedMotion={reducedMotion} warpRef={pager.warpRef} />
      <TopBar onHome={() => travelTo(0)} onMap={() => { if (pager.viewState === 'active') setMapOpen(true); }} />
      <UniverseView
        key={index}
        index={index}
        state={pager.viewState}
        kind={pager.jumpKind}
        anchor={pager.arrivals === 0 && initial ? initial.anchor : null}
        focusHeading={pager.arrivals > 0}
        onTravel={onTravel}
      />
      <BottomNav active={UNIVERSE_ORDER[index]} onSelect={onSelect} />
      <Sheet open={mapOpen} onClose={closeMap} label="Multiverse map" variant="full">
        <MultiverseMap current={index} onPick={onPick} />
      </Sheet>
    </div>
  );
};

export default MobileApp;
