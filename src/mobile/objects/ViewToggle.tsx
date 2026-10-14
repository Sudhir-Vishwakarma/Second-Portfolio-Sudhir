import React from 'react';
import { ViewMode } from './useViewMode';

/** Orbit | List switch. List always shows the plain cards. */
export const ViewToggle: React.FC<{ mode: ViewMode; onChange: (mode: ViewMode) => void; label: string }> = ({ mode, onChange, label }) => (
  <div className="mb-viewtoggle" role="group" aria-label={`${label} view`}>
    <button aria-pressed={mode === 'orbit'} onClick={() => onChange('orbit')}>Orbit</button>
    <button aria-pressed={mode === 'list'} onClick={() => onChange('list')}>List</button>
  </div>
);
