import React from 'react';
import { UniverseId } from '../journey';
import { makeBasicUniverse } from './BasicUniverse';
import { HomeUniverse } from './HomeUniverse';
import { AboutUniverse } from './AboutUniverse';
import { SkillsUniverse } from './SkillsUniverse';
import { CertificationsUniverse } from './CertificationsUniverse';
import { WorkUniverse } from './WorkUniverse';
import { ProjectsUniverse } from './ProjectsUniverse';

export interface UniverseProps {
  /** Camera is in this universe: enable labels and pointer interaction. */
  active: boolean;
  /** Rendered inside a portal disc: no labels, no interaction. */
  preview?: boolean;
}

export const UNIVERSE_COMPONENTS: Record<UniverseId, React.FC<UniverseProps>> = {
  home: HomeUniverse,
  about: AboutUniverse,
  skills: SkillsUniverse,
  certifications: CertificationsUniverse,
  work: WorkUniverse,
  projects: ProjectsUniverse,
  contact: makeBasicUniverse('contact'),
};
