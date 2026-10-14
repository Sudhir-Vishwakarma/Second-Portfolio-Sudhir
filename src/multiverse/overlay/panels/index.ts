// overlay/panels/index.ts
import React from 'react';
import { UniverseId } from '../../journey';
import { GenericPanel } from './GenericPanel';
import { HomePanel } from './HomePanel';
import { AboutPanel } from './AboutPanel';
import { SkillsPanel } from './SkillsPanel';
import { CertificationsPanel } from './CertificationsPanel';
import { WorkPanel } from './WorkPanel';
import { ProjectsPanel } from './ProjectsPanel';

export interface PanelProps { universe: UniverseId; beat: string }

export const PANELS: Record<UniverseId, React.FC<PanelProps>> = {
  home: HomePanel,
  about: AboutPanel,
  skills: SkillsPanel,
  certifications: CertificationsPanel,
  work: WorkPanel,
  projects: ProjectsPanel,
  contact: GenericPanel,
};
