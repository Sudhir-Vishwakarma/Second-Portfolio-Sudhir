import {
  profile, socials, aboutSummary, skills, education, certifications, experience, projects,
  newestFirst, descriptionParagraphs, CONSTELLATIONS, SKILL_GROUPS,
} from './portfolio';

describe('portfolio data', () => {
  it('has the profile essentials', () => {
    expect(profile.firstName).toBe('SUDHIR');
    expect(profile.lastName).toBe('VISHWAKARMA');
    expect(profile.typingWords).toEqual(['FULL-STACK DEVELOPER', 'REACT.JS/NEXT.JS', 'STRAPI/FIREBASE']);
    expect(profile.cvUrl).toBe('/Sudhir-Profile2.pdf');
    expect(profile.bio.startsWith('A highly driven Front-End Engineer')).toBe(true);
    expect(aboutSummary.startsWith('Results-driven developer')).toBe(true);
  });

  it('has four https social links in classic order', () => {
    expect(socials.map((s) => s.id)).toEqual(['facebook', 'instagram', 'linkedin', 'github']);
    socials.forEach((s) => expect(s.url.startsWith('https://')).toBe(true));
  });

  it('has 20 skills split across the 5 groups', () => {
    expect(skills).toHaveLength(20);
    const count = (g: string) => skills.filter((s) => s.group === g).length;
    expect(SKILL_GROUPS.map(count)).toEqual([5, 7, 3, 2, 3]);
  });

  it('has 4 education entries, 4 certifications and 3 jobs newest first', () => {
    expect(education).toHaveLength(4);
    expect(certifications).toHaveLength(4);
    expect(experience.map((e) => e.company)).toEqual(['Realatte', 'Starz Ventures Pvt Ltd', 'Entrance1.com']);
    expect(experience[0]).toMatchObject({ start: 'Feb 2026', end: 'Nov 2026' });
  });

  it('has 23 complete projects in 4 constellations', () => {
    expect(projects).toHaveLength(23);
    projects.forEach((p) => {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.technologies.length).toBeGreaterThan(0);
      expect(CONSTELLATIONS).toContain(p.constellation);
    });
    const count = (c: string) => projects.filter((p) => p.constellation === c).length;
    expect(CONSTELLATIONS.map(count)).toEqual([2, 4, 4, 13]);
  });

  it('newestFirst returns a reversed copy and never mutates the source', () => {
    const before = projects.map((p) => p.title);
    const reversed = newestFirst(projects);
    expect(reversed[0].title).toBe('Shubhdhanam CRM');
    newestFirst(projects);
    expect(projects.map((p) => p.title)).toEqual(before);
  });

  it('descriptionParagraphs matches the classic modal splitting', () => {
    expect(descriptionParagraphs('One. Tech Stack: A, B. Last one')).toEqual(['One.', 'Tech Stack: A, B', 'Last one']);
  });
});
