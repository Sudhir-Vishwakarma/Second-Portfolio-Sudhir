import React from 'react';

export const TopBar: React.FC<{ onHome: () => void; onMap: () => void }> = ({ onHome, onMap }) => (
  <header className="mb-topbar">
    <button className="mb-mono" onClick={onHome} aria-label="Go to Home">SV</button>
    <button className="mb-mapbtn" onClick={onMap} aria-label="Multiverse map">
      <svg viewBox="-12 -12 24 24" aria-hidden="true">
        <path d="M0,0 m-9,0 a9,4 -20 1,0 18,0 a9,4 -20 1,0 -18,0" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle r="3" fill="currentColor" />
        <circle cx="7" cy="-6" r="1.4" fill="currentColor" />
      </svg>
      <span aria-hidden="true">Map</span>
    </button>
  </header>
);
