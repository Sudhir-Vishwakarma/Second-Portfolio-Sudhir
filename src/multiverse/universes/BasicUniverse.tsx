// a nebula in the universe's palette (used until each universe is built)
import React from 'react';
import { Nebula } from '../fx/Nebula';
import { PALETTES } from '../fx/palettes';
import { UniverseId } from '../journey';
import { UniverseProps } from './index';

export const makeBasicUniverse = (id: UniverseId): React.FC<UniverseProps> => {
  const Basic: React.FC<UniverseProps> = () => <Nebula palette={PALETTES[id]} />;
  Basic.displayName = `BasicUniverse(${id})`;
  return Basic;
};
