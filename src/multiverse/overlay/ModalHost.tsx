import React, { useEffect, useRef } from 'react';
import { useJourney } from '../store';
import { CvModal } from './modals/CvModal';
import { CertificateModal } from './modals/CertificateModal';
import { ProjectDetail } from './modals/ProjectDetail';
import { certifications, projects } from '../../data/portfolio';

export const ModalHost: React.FC = () => {
  const modal = useJourney((s) => s.modal);
  const close = useJourney((s) => s.closeModal);
  const closeBtn = useRef<HTMLButtonElement>(null);

  const isOpen = !!modal;

  // Remember what had focus when the modal opened and give it back when the modal closes.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    return () => {
      if (opener && opener.isConnected && typeof opener.focus === 'function') opener.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (modal) closeBtn.current?.focus();
  }, [modal]);

  if (!modal) return null;

  let body: React.ReactNode = null;
  let sheet = false;
  let label = '';
  switch (modal.kind) {
    case 'cv':
      body = <CvModal />;
      label = 'Resume';
      break;
    case 'certificate':
      body = <CertificateModal index={modal.index} />;
      label = certifications[modal.index]?.title ?? 'Certificate';
      break;
    case 'project':
      body = <ProjectDetail index={modal.index} />;
      label = projects[modal.index]?.title ?? 'Project';
      sheet = true;
      break;
    default:
      return null;
  }

  return (
    <div className={`mv-modal${sheet ? ' mv-modal--sheet' : ''}`} role="dialog" aria-modal="true" aria-label={label} onClick={close}>
      <div className="mv-modal__box" onClick={(e) => e.stopPropagation()} data-capture-scroll>
        <button ref={closeBtn} className="mv-modal__close" aria-label="Close" onClick={close}>×</button>
        {body}
      </div>
    </div>
  );
};
