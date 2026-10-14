import React from 'react';
import { MOBILE_SECTIONS, MobileSectionId } from './sections';

// 24×24 outline icons (Heroicons-style paths)
const ICONS: Record<MobileSectionId, string> = {
  home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
  about: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  skills: 'M8 8 4 12l4 4M16 8l4 4-4 4M13.5 5l-3 14',
  work: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  projects: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  contact: 'M3 6h18v12H3zM3 7l9 6 9-6',
};

interface BottomNavProps { active: MobileSectionId; onSelect: (id: MobileSectionId) => void }

export const BottomNav: React.FC<BottomNavProps> = ({ active, onSelect }) => (
  <nav className="mb-nav" aria-label="Sections">
    {MOBILE_SECTIONS.map((s) => (
      <button
        key={s.id}
        className={`mb-nav__item${s.id === active ? ' is-active' : ''}`}
        style={{ '--accent': s.accent } as React.CSSProperties}
        aria-current={s.id === active ? 'true' : undefined}
        onClick={() => onSelect(s.id)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={ICONS[s.id]} />
        </svg>
        <span>{s.label}</span>
      </button>
    ))}
  </nav>
);
