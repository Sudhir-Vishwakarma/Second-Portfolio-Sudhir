import React, { useState } from 'react';
import { certifications, education } from '../../data/portfolio';
import { PALETTES } from '../../multiverse/fx/palettes';
import { ObjectStage } from './ObjectStage';
import { Planet } from './Planet';
import { ringPoints } from './orbitLayouts';

type Selection = { kind: 'edu' | 'cert'; i: number };

const EDU = ringPoints(education.length, 22);
const CERTS = ringPoints(certifications.length, 40, -Math.PI / 4);

/** Education as moons and certifications as satellites around a home planet. #certifications selects the first certificate. */
export const OriginSystem: React.FC<{ onViewCert: (index: number) => void }> = ({ onViewCert }) => {
  const [sel, setSel] = useState<Selection>(() => (window.location.hash === '#certifications' ? { kind: 'cert', i: 0 } : { kind: 'edu', i: 0 }));
  const isSel = (kind: Selection['kind'], i: number) => sel.kind === kind && sel.i === i;
  const edu = education[sel.i];
  const cert = certifications[sel.i];
  return (
    <div className="mb-orbit-view">
      <ObjectStage label="Origin system: education and certifications" className="mb-origin" id="certifications">
        <svg className="mb-orbit__art" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="0.3" strokeDasharray="1 1.5" />
          <g transform="translate(50 50)">
            <Planet r={10} color={PALETTES.about.atmos} />
          </g>
        </svg>
        <div className="mb-orbit__ring" style={{ '--period': '90s' } as React.CSSProperties}>
          {education.map((e, i) => (
            <button
              key={e.years}
              className={`mb-orbit__node${isSel('edu', i) ? ' is-selected' : ''}`}
              style={{ left: `${EDU[i].x}%`, top: `${EDU[i].y}%`, '--glow': '#e2e8f0' } as React.CSSProperties}
              aria-label={`Education: ${e.title}, ${e.years}`}
              aria-pressed={isSel('edu', i)}
              onClick={() => setSel({ kind: 'edu', i })}
            >
              <span className="mb-orbit__upright">
                <svg className="mb-orbit__glyph" width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
                  <Planet r={7} color="#cbd5e1" />
                </svg>
                <span className="mb-orbit__label">{e.years.slice(0, 4)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mb-orbit__ring" style={{ '--period': '140s' } as React.CSSProperties}>
          {certifications.map((c, i) => (
            <button
              key={c.title}
              className={`mb-orbit__node${isSel('cert', i) ? ' is-selected' : ''}`}
              style={{ left: `${CERTS[i].x}%`, top: `${CERTS[i].y}%`, '--glow': '#ffb347' } as React.CSSProperties}
              aria-label={`Certification: ${c.title}`}
              aria-pressed={isSel('cert', i)}
              onClick={() => setSel({ kind: 'cert', i })}
            >
              <span className="mb-orbit__upright">
                <svg className="mb-orbit__glyph" width="26" height="26" viewBox="-13 -13 26 26" aria-hidden="true">
                  <rect x="-3.5" y="-3.5" width="7" height="7" rx="1.5" fill="#ffb347" />
                  <rect x="-12" y="-2" width="7" height="4" fill="#7dd3fc" opacity="0.85" />
                  <rect x="5" y="-2" width="7" height="4" fill="#7dd3fc" opacity="0.85" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </ObjectStage>
      <div aria-live="polite">
      {sel.kind === 'edu' ? (
        <div className="mb-card mb-orbit-panel mb-origin__panel">
          <span className="mb-kicker">Education</span>
          <span className="mb-timeline__years">{edu.years}</span>
          <strong>{edu.title}</strong>
          <span className="mb-timeline__place">{edu.school}</span>
        </div>
      ) : (
        <div className="mb-card mb-cert mb-orbit-panel">
          <div>
            <span className="mb-kicker">Certification</span>
            <strong>{cert.title}</strong>
            <span>{cert.provider}</span>
          </div>
          <button className="mb-btn mb-btn--ghost" onClick={() => onViewCert(sel.i)}>View</button>
        </div>
      )}
      </div>
    </div>
  );
};
