// overlay/Caption.tsx — phones: a short title over the scene; "Read more" opens the full panel
import React, { useEffect, useState } from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';
import { profile } from '../../data/portfolio';
import { stepCaption } from './caption';

export const Caption: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const booted = useJourney((s) => s.booted);
  const modal = useJourney((s) => s.modal);
  const openModal = useJourney((s) => s.openModal);
  const [shown, setShown] = useState(step);

  useEffect(() => {
    if (!moving) setShown(step);
  }, [moving, step]);

  const visible = booted && !moving && !modal && shown === step;
  const { kicker, title, tip } = stepCaption(shown);
  return (
    <section
      key={shown}
      className={`mv-caption${visible ? ' is-shown' : ''}`}
      aria-hidden={!visible}
      {...(!visible ? ({ inert: '' } as Record<string, string>) : {})}
    >
      <span className="mv-kicker">{kicker}</span>
      <h2 className="mv-caption__title">{title}</h2>
      {tip && <p className="mv-caption__tip">{tip}</p>}
      <div className="mv-caption__actions">
        <button className="mv-btn" onClick={() => openModal({ kind: 'details' })}>Read more</button>
        {STEPS[shown].universe === 'home' && (
          <a className="mv-btn mv-btn--ghost" href={profile.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a>
        )}
      </div>
    </section>
  );
};
