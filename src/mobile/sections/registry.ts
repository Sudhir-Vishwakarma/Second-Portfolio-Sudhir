import React from 'react';
import { MobileSection, MobileSectionId } from '../sections';
import { GenericSection } from './GenericSection';
import { HomeSection } from './HomeSection';
import { AboutSection } from './AboutSection';

export interface SectionProps { section: MobileSection }

export const SECTION_COMPONENTS: Record<MobileSectionId, React.FC<SectionProps>> = {
  home: HomeSection,
  about: AboutSection,
  skills: GenericSection,
  work: GenericSection,
  projects: GenericSection,
  contact: GenericSection,
};
