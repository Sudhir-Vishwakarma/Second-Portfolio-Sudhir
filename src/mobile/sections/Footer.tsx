import React from 'react';
import SocialIcons from '../../components/SocialIcons';

export const Footer: React.FC = () => (
  <footer className="mb-footer">
    <SocialIcons className="mb-socials" linkClassName="mb-social" size={18} />
    <a className="mb-footer__classic" href="#classic">Classic view</a>
    <p className="mb-footer__copy">© {new Date().getFullYear()} Sudhir Vishwakarma</p>
  </footer>
);
