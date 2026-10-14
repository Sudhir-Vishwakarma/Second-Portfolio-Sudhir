// overlay/PanelFrame.tsx
import React from 'react';

export const PanelFrame: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => (
  <section className={`mv-panel${show ? ' is-shown' : ''}`} aria-hidden={!show} {...(!show ? ({ inert: '' } as Record<string, string>) : {})} data-capture-scroll>
    {children}
  </section>
);
