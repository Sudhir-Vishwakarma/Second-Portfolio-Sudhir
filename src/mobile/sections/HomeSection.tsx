import React from 'react';
import { profile } from '../../data/portfolio';
import { useTypewriter } from '../../hooks/typewriter';
import SocialIcons from '../../components/SocialIcons';
import { SolarHero } from '../SolarHero';
import { SectionProps } from './registry';

export const HomeSection: React.FC<SectionProps> = () => {
  const word = useTypewriter(profile.typingWords);
  return (
    <div className="mb-home">
      <SolarHero />
      <span className="mb-kicker" data-reveal>{profile.greeting}</span>
      <h1 className="mb-h1" data-reveal>{profile.firstName}<br />{profile.lastName}</h1>
      <p className="mb-typing" data-reveal>
        {profile.titlePrefix} <span className="mb-typing__word">{word}</span>
        <span className="mb-typing__cursor" aria-hidden="true">|</span>
      </p>
      <p className="mb-text" data-reveal>{profile.bio}</p>
      <div className="mb-home__actions" data-reveal>
        <a className="mb-btn" href={profile.cvUrl} target="_blank" rel="noopener noreferrer">View CV</a>
        <a className="mb-btn mb-btn--ghost" href={profile.cvUrl} download={profile.cvDownloadName}>Download CV</a>
      </div>
      <div data-reveal>
        <SocialIcons className="mb-socials mb-socials--start" linkClassName="mb-social" size={18} />
      </div>
    </div>
  );
};
