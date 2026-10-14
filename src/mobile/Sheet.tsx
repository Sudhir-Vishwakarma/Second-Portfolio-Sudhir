import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  variant?: 'bottom' | 'full';
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, onClose, label, variant = 'bottom', children }) => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const touchY = useRef<number | null>(null);

  // Close through history when we own the top entry, so Back and ✕ behave the same.
  const requestClose = useCallback(() => {
    if (window.history.state && window.history.state.mbSheet) window.history.back();
    else onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    window.history.pushState({ mbSheet: true }, '');
    const onPop = () => onCloseRef.current();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && opener.isConnected) opener.focus();
    };
  }, [open, requestClose]);

  if (!open) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    touchY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchY.current === null || !panel.current) return;
    const dy = Math.max(0, e.touches[0].clientY - touchY.current);
    panel.current.style.transform = `translateY(${dy}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchY.current === null || !panel.current) return;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchY.current = null;
    panel.current.style.transform = '';
    if (dy > 80) requestClose();
  };

  // Portal to the .mb root: .mb-main is a z-index:1 stacking context that would otherwise keep the sheet under the top bar and bottom nav.
  return createPortal(
    <div className={`mb-sheet mb-sheet--${variant}`} role="dialog" aria-modal="true" aria-label={label} onClick={requestClose}>
      <div className="mb-sheet__panel" ref={panel} onClick={(e) => e.stopPropagation()}>
        <div className="mb-sheet__handle" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <span />
        </div>
        <button ref={closeBtn} className="mb-sheet__close" aria-label="Close" onClick={requestClose}>×</button>
        <div className="mb-sheet__body">{children}</div>
      </div>
    </div>,
    document.querySelector('.mb') || document.body
  );
};
