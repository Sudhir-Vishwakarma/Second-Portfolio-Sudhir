import React from 'react';

export const SectionHeading: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => (
  <header className="mb-heading" data-reveal>
    <span className="mb-kicker">{kicker}</span>
    <h2 className="mb-h2">{title}</h2>
  </header>
);
