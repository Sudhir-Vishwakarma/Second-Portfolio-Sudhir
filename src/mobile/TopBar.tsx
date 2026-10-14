import React from 'react';

export const TopBar: React.FC<{ onHome: () => void }> = ({ onHome }) => (
  <header className="mb-topbar">
    <button className="mb-mono" onClick={onHome} aria-label="Go to Home">SV</button>
  </header>
);
