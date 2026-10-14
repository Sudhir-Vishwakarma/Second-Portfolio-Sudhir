import React from 'react';
import { certifications } from '../../../data/portfolio';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const CertificationsPanel: React.FC<PanelProps> = () => {
  const openModal = useJourney((s) => s.openModal);
  return (
    <div>
      <span className="mv-kicker">Certifications</span>
      <h2 className="mv-h2">Archive of Light</h2>
      <ul className="mv-cards">
        {certifications.map((c, i) => (
          <li key={c.title} className="mv-card" style={{ '--i': i } as React.CSSProperties}>
            <div>
              <strong>{c.title}</strong>
              <span>{c.provider}</span>
            </div>
            <button className="mv-btn mv-btn--ghost" onClick={() => openModal({ kind: 'certificate', index: i })}>View</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
