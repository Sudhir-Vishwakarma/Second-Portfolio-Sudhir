// overlay/panels/index.ts
import React from 'react';
import { UniverseId } from '../../journey';
import { GenericPanel } from './GenericPanel';

export interface PanelProps { universe: UniverseId; beat: string }

export const PANELS: Record<UniverseId, React.FC<PanelProps>> = {
  home: GenericPanel,
  about: GenericPanel,
  skills: GenericPanel,
  certifications: GenericPanel,
  work: GenericPanel,
  projects: GenericPanel,
  contact: GenericPanel,
};
