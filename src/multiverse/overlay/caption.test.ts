import { stepCaption, touchHint } from './caption';
import { STEPS, firstStepOf } from '../journey';
import { experience } from '../../data/portfolio';

test('home caption is the greeting and full name', () => {
  expect(stepCaption(0)).toMatchObject({ kicker: "HELLO I'M", title: 'SUDHIR VISHWAKARMA' });
});

test('work stops are titled by role and name the company', () => {
  const i = firstStepOf('work');
  expect(stepCaption(i).title).toBe(experience[0].role);
  expect(stepCaption(i).kicker).toContain(experience[0].company);
  expect(stepCaption(i + 2).title).toBe(experience[2].role);
});

test('every stop has a caption', () => {
  STEPS.forEach((_, i) => {
    const c = stepCaption(i);
    expect(c.kicker.length).toBeGreaterThan(0);
    expect(c.title.length).toBeGreaterThan(0);
  });
});

test('hints are rewritten for touch', () => {
  expect(touchHint('Scroll to warp to About')).toBe('Swipe up to warp to About');
  expect(touchHint('Scroll for Education')).toBe('Swipe up for Education');
  expect(touchHint('Scroll up to travel back')).toBe('Swipe down to travel back');
  expect(touchHint('Click a star · Scroll to warp to Contact')).toBe('Tap a star · Swipe up to warp to Contact');
});

test('stops with tappable objects tell the visitor what to tap', () => {
  expect(stepCaption(0).tip).toBe('Tap a planet to travel there');
  expect(stepCaption(firstStepOf('about')).tip).toBe('Tap Earth or a moon');
  expect(stepCaption(firstStepOf('skills')).tip).toBe('Tap a planet, then a skill');
  expect(stepCaption(firstStepOf('certifications')).tip).toBe('Tap a satellite');
  expect(stepCaption(firstStepOf('work')).tip).toBe('Tap the planet for the full role');
  expect(stepCaption(firstStepOf('projects')).tip).toBe('Tap a star · Pinch to zoom');
  expect(stepCaption(firstStepOf('contact')).tip).toBeUndefined();
});
