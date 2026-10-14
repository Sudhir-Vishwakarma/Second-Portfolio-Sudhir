import React, { useState } from 'react';

export interface ObjectStageProps {
  /** Accessible name; without one the stage is decorative (aria-hidden). */
  label?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

/** Square stage for an interactive space object. Orbits pause while it is pressed so targets hold still. */
export const ObjectStage: React.FC<ObjectStageProps> = ({ label, id, className, children }) => {
  const [held, setHeld] = useState(false);
  const release = () => setHeld(false);
  return (
    <div
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
