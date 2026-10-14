// overlay/panels/index.ts
import React from 'react';
import { UniverseId } from '../../journey';
import { GenericPanel } from './GenericPanel';
import { HomePanel } from './HomePanel';

export interface PanelProps { universe: UniverseId; beat: string }

export const PANELS: Record<UniverseId, React.FC<PanelProps>> = {
  home: HomePanel,
  about: GenericPanel,
  skills: GenericPanel,
  certifications: GenericPanel,
  work: GenericPanel,
  projects: GenericPanel,
  contact: GenericPanel,
};
