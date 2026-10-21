import {
  profile, socials, aboutSummary, skills, education, certifications, experience, projects,
  newestFirst, descriptionParagraphs, CONSTELLATIONS, SKILL_GROUPS,
} from './portfolio';

describe('portfolio data', () => {
  it('has the profile essentials', () => {
    expect(profile.firstName).toBe('SUDHIR');
    expect(profile.lastName).toBe('VISHWAKARMA');
    expect(profile.typingWords).toEqual(['FULL-STACK DEVELOPER', 'REACT.JS/NEXT.JS', 'STRAPI/FIREBASE']);
    expect(profile.cvUrl).toBe('/Sudhir-Vishwakarma-Resume-2026-10.pdf');
    // The resume objective, shown on both Home and About.
    expect(profile.bio.startsWith('Results-driven Full-Stack Developer with experience building scalable SaaS platforms')).toBe(true);
    expect(profile.bio.endsWith('build efficient, scalable, and business-focused software solutions.')).toBe(true);
    expect(aboutSummary).toBe(profile.bio);
  });

  it('has four https social links in classic order', () => {
    expect(socials.map((s) => s.id)).toEqual(['facebook', 'instagram', 'linkedin', 'github']);
    socials.forEach((s) => expect(s.url.startsWith('https://')).toBe(true));
  });

  it('has the 30 resume skills in the 7 resume groups', () => {
    expect(SKILL_GROUPS).toEqual(['Languages', 'Database', 'Framework', 'Version Control', 'Tools', 'Operating System', 'AI Tools']);
    expect(skills).toHaveLength(30);
    const names = (g: string) => skills.filter((s) => s.group === g).map((s) => s.name);
    expect(names('Languages')).toEqual(['Python', 'PHP', 'C/C++', 'HTML', 'CSS', 'JavaScript', 'TypeScript']);
    expect(names('Database')).toEqual(['MongoDB', 'SQL']);
    expect(names('Framework')).toEqual(['Sass', 'Bootstrap', 'Tailwind CSS', 'Laravel', 'React.js (Redux)', 'Next.js']);
    expect(names('Version Control')).toEqual(['Git', 'GitHub', 'GitLab']);
    expect(names('Tools')).toEqual(['Firebase', 'Supabase', 'Strapi', 'Vercel', 'NPM', 'Visual Studio Code', 'Salesforce']);
    expect(names('Operating System')).toEqual(['Linux']);
    expect(names('AI Tools')).toEqual(['RAG', 'Claude', 'Codex', 'Amazon Q']);
  });

  it('has 4 education entries, 4 certifications and 3 jobs newest first', () => {
    expect(education).toHaveLength(4);
    expect(certifications).toHaveLength(4);
    expect(experience.map((e) => e.company)).toEqual(['Realatte', 'Starz Ventures Pvt Ltd', 'Entrance1.com']);
    expect(experience[0]).toMatchObject({ start: 'Feb 2026', end: 'Nov 2026' });
  });

  it('has 24 complete projects in 4 constellations', () => {
    expect(projects).toHaveLength(24);
    projects.forEach((p) => {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.technologies.length).toBeGreaterThan(0);
      expect(CONSTELLATIONS).toContain(p.constellation);
    });
    const count = (c: string) => projects.filter((p) => p.constellation === c).length;
    expect(CONSTELLATIONS.map(count)).toEqual([3, 4, 4, 13]);
  });

  it('newestFirst returns a reversed copy and never mutates the source', () => {
    const before = projects.map((p) => p.title);
    const reversed = newestFirst(projects);
    expect(reversed[0].title).toBe('BrewHouse — AI-Powered Multi-Tenant SaaS CRM');
    newestFirst(projects);
    expect(projects.map((p) => p.title)).toEqual(before);
  });

  it('descriptionParagraphs matches the classic modal splitting', () => {
    expect(descriptionParagraphs('One. Tech Stack: A, B. Last one')).toEqual(['One.', 'Tech Stack: A, B', 'Last one']);
  });
});
