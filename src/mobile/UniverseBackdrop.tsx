import React from 'react';
import { MobileSectionId } from './sections';

/** Decorative per-universe space: two drifting nebula glows in the accent. The hero object carries the signature. */
export const UniverseBackdrop: React.FC<{ id: MobileSectionId }> = ({ id }) => (
  <div className="mb-backdrop" data-universe-backdrop={id} aria-hidden="true">
    <span className="mb-backdrop__nebula mb-backdrop__nebula--a" />
    <span className="mb-backdrop__nebula mb-backdrop__nebula--b" />
  </div>
);
