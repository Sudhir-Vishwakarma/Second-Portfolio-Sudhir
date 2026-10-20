// overlay/ZoomControls.tsx — phones: one-handed + / − for the Project Galaxy (pinch works too)
import React from 'react';
import { universeOf } from '../journey';
import { useJourney } from '../store';
import { useCompact } from '../useCompact';
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../zoom';

export const ZoomControls: React.FC = () => {
  const compact = useCompact();
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const booted = useJourney((s) => s.booted);
  const modal = useJourney((s) => s.modal);
  const zoom = useJourney((s) => s.zoom);
  const setZoom = useJourney((s) => s.setZoom);
  if (!compact || !booted || moving || modal || universeOf(step) !== 'projects') return null;
  return (
    <div className="mv-zoom" role="group" aria-label="Zoom the galaxy">
      <button onClick={() => setZoom(zoom / ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} aria-label="Zoom in">+</button>
      <button onClick={() => setZoom(zoom * ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} aria-label="Zoom out">−</button>
    </div>
  );
};
