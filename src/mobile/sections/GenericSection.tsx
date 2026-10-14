import React from 'react';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

export const GenericSection: React.FC<SectionProps> = ({ section }) => (
  <SectionHeading kicker={section.label} title={section.label} />
);
