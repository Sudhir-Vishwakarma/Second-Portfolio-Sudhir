// The planets of the solar system: each one is a section of the portfolio.
export interface Section {
  id: string;
  label: string;
  tagline: string;
  orbit: number;
  size: number;
  speed: number;
  colorA: string;
  colorB: string;
  atmos: string;
  bands: number;
  ring?: boolean;
}

export const SECTIONS: Section[] = [
  { id: 'about', label: 'About', tagline: 'Who I am', orbit: 7, size: 0.7, speed: 0.22, colorA: '#1d4ed8', colorB: '#38bdf8', atmos: '#60a5fa', bands: 6 },
  { id: 'work', label: 'Work', tagline: 'Where I have built', orbit: 10.5, size: 0.9, speed: 0.15, colorA: '#7f1d1d', colorB: '#f97316', atmos: '#fb923c', bands: 10 },
  { id: 'projects', label: 'Projects', tagline: 'The multiverse of things I made', orbit: 14.5, size: 1.25, speed: 0.1, colorA: '#4c1d95', colorB: '#e879f9', atmos: '#c084fc', bands: 14, ring: true },
  { id: 'contact', label: 'Contact', tagline: 'Open a channel', orbit: 18.5, size: 0.8, speed: 0.07, colorA: '#064e3b', colorB: '#34d399', atmos: '#6ee7b7', bands: 8 },
];

// A few projects shown as holograms inside the Projects universe (prototype only).
export const PROJECTS = [
  { title: 'Shubhdhanam CRM', tag: 'Financial CRM · React · Firebase', url: 'https://crm.shubhdhanam.com/dashboard' },
  { title: 'STARZAi CRM', tag: 'Multi-tenant CRM · Cloud Run · OpenAI', url: 'https://crm.starz.vip' },
  { title: 'Channel Partner Portal', tag: 'PHP 8 · Salesforce · Playwright', url: 'https://cpportal.spacegroupco.com/login.php' },
  { title: 'Customer Portal', tag: 'PHP 8 · Salesforce · OTP auth', url: 'https://customerportal.spacegroupco.com/login.php' },
  { title: 'Harmony Infra Ventures', tag: 'Next.js · Strapi · Real estate', url: 'https://harmonyinfraventures.com/' },
  { title: 'Digital Kundali', tag: 'TypeScript · React · Tailwind', url: 'https://kundali.starz.vip/' },
];
