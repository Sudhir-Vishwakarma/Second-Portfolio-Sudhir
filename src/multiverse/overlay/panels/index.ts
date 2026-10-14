// overlay/panels/index.ts
import React from 'react';
import { UniverseId } from '../../journey';
import { GenericPanel } from './GenericPanel';
import { HomePanel } from './HomePanel';
import { AboutPanel } from './AboutPanel';
import { SkillsPanel } from './SkillsPanel';

export interface PanelProps { universe: UniverseId; beat: string }

export const PANELS: Record<UniverseId, React.FC<PanelProps>> = {
  home: HomePanel,
  about: AboutPanel,
  skills: SkillsPanel,
  certifications: GenericPanel,
  work: GenericPanel,
  projects: GenericPanel,
  contact: GenericPanel,
};
