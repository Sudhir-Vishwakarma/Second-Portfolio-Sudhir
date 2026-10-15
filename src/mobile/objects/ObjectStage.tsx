import React, { useRef, useState } from 'react';
import { useReducedMotion } from '../useReducedMotion';
import { useHeroMotion } from './useHeroMotion';

export interface ObjectStageProps {
  /** Accessible name; without one the stage is decorative (aria-hidden). */
  label?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Square stage for an interactive space object (the universe's hero). Orbits pause while it is pressed so
 * targets hold still; it drifts with scroll, tilts when dragged and ripples on a tap (all off with reduced motion).
 */
export const ObjectStage: React.FC<ObjectStageProps> = ({ label, id, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [held, setHeld] = useState(false);
  useHeroMotion(ref, !reducedMotion);
  const release = () => setHeld(false);
  return (
    <div
      ref={ref}
      id={id}
      className={`mb-orbit${className ? ` ${className}` : ''}${held ? ' is-held' : ''}`}
      role={label ? 'group' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
    >
      {children}
    </div>
  );
};
