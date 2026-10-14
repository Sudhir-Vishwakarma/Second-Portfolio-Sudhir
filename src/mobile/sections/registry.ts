import React from 'react';
import { MobileSection, MobileSectionId } from '../sections';
import { GenericSection } from './GenericSection';
import { HomeSection } from './HomeSection';
import { AboutSection } from './AboutSection';
import { SkillsSection } from './SkillsSection';
import { WorkSection } from './WorkSection';
import { ProjectsSection } from './ProjectsSection';

export interface SectionProps { section: MobileSection }

export const SECTION_COMPONENTS: Record<MobileSectionId, React.FC<SectionProps>> = {
  home: HomeSection,
  about: AboutSection,
  skills: SkillsSection,
  work: WorkSection,
  projects: ProjectsSection,
  contact: GenericSection,
};
