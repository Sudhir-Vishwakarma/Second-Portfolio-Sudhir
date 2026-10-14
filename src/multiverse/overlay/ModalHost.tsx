import React, { useEffect, useRef } from 'react';
import { useJourney } from '../store';
import { CvModal } from './modals/CvModal';
import { CertificateModal } from './modals/CertificateModal';

export const ModalHost: React.FC = () => {
  const modal = useJourney((s) => s.modal);
  const close = useJourney((s) => s.closeModal);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modal) closeBtn.current?.focus();
  }, [modal]);

  if (!modal) return null;

  let body: React.ReactNode = null;
  let sheet = false;
  switch (modal.kind) {
    case 'cv':
      body = <CvModal />;
      break;
    case 'certificate':
      body = <CertificateModal index={modal.index} />;
      break;
    default:
      return null;
  }

  return (
    <div className={`mv-modal${sheet ? ' mv-modal--sheet' : ''}`} role="dialog" aria-modal="true" onClick={close}>
      <div className="mv-modal__box" onClick={(e) => e.stopPropagation()} data-capture-scroll>
        <button ref={closeBtn} className="mv-modal__close" aria-label="Close" onClick={close}>×</button>
        {body}
      </div>
    </div>
  );
};
