// overlay/Panels.tsx — shows the panel for the step the camera has arrived at
import React, { useEffect, useState } from 'react';
import { STEPS } from '../journey';
import { useJourney } from '../store';
import { PANELS } from './panels';
import { PanelFrame } from './PanelFrame';

export const Panels: React.FC = () => {
  const step = useJourney((s) => s.step);
  const moving = useJourney((s) => s.moving);
  const booted = useJourney((s) => s.booted);
  const [shown, setShown] = useState(step);

  useEffect(() => {
    if (!moving) setShown(step);
  }, [moving, step]);

  const { universe, beat } = STEPS[shown];
  const Panel = PANELS[universe];
  return (
    <PanelFrame key={shown} show={booted && !moving && shown === step}>
      <Panel universe={universe} beat={beat} />
    </PanelFrame>
  );
};
