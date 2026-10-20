// overlay/caption.ts — the short title a phone shows over the 3D scene for each stop
import { STEPS } from '../journey';
import { experience, profile } from '../../data/portfolio';

/** tip: what the visitor can tap in this stop's 3D scene. */
export interface Caption { kicker: string; title: string; tip?: string }

export function stepCaption(i: number): Caption {
  const { universe, beat } = STEPS[Math.max(0, Math.min(STEPS.length - 1, i))];
  switch (universe) {
    case 'home':
      return { kicker: profile.greeting, title: `${profile.firstName} ${profile.lastName}`, tip: 'Tap a planet to travel there' };
    case 'about':
      return beat === 'education'
        ? { kicker: 'About · 2 / 2', title: 'Education', tip: 'Tap Earth or a moon' }
        : { kicker: 'About · 1 / 2', title: 'About Me', tip: 'Tap Earth or a moon' };
    case 'skills':
      return { kicker: 'Technical Skills', title: 'My Tech Belt', tip: 'Tap an asteroid' };
    case 'certifications':
      return { kicker: 'Certifications', title: 'Archive of Light', tip: 'Tap a satellite' };
    case 'work': {
      const job = experience[Number(beat.replace('job-', '')) || 0];
      return { kicker: `Work · ${job.company}`, title: job.role, tip: 'Tap the planet for the full role' };
    }
    case 'projects':
      return { kicker: 'My Projects', title: 'Project Galaxy', tip: 'Tap a star to open a project' };
    case 'contact':
      return { kicker: 'Contact', title: "Let's Connect" };
  }
}

/** Desktop hints speak mouse ("Scroll", "Click"); touch screens swipe and tap. */
export function touchHint(hint: string): string {
  return hint.replace(/Scroll up/g, 'Swipe down').replace(/Scroll/g, 'Swipe up').replace(/Click/g, 'Tap');
}
