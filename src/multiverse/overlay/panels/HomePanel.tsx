import React from 'react';
import { profile } from '../../../data/portfolio';
import { useTypewriter } from '../../../hooks/typewriter';
import SocialIcons from '../../../components/SocialIcons';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const HomePanel: React.FC<PanelProps> = () => {
  const text = useTypewriter(profile.typingWords);
  const openModal = useJourney((s) => s.openModal);
  return (
    <div className="mv-home">
      <span className="mv-kicker">{profile.greeting}</span>
      <h1 className="mv-h1">{profile.firstName}<br />{profile.lastName}</h1>
      <p className="mv-typing">
        {profile.titlePrefix} <span className="mv-typing__word">{text}</span>
        <span className="mv-typing__cursor" aria-hidden="true">|</span>
      </p>
      <p className="mv-text">{profile.bio}</p>
      <div className="mv-actions">
        <button className="mv-btn" onClick={() => openModal({ kind: 'cv' })}>View CV</button>
        <a className="mv-btn mv-btn--ghost" href={profile.cvUrl} download={profile.cvDownloadName}>Download CV</a>
      </div>
      <SocialIcons className="mv-socials" linkClassName="mv-social" size={18} />
    </div>
  );
};
