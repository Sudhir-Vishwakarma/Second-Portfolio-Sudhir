import React, { useState } from 'react';
import { profile } from '../../data/portfolio';
import { useContactForm } from '../../hooks/contact';
import { SectionHeading } from '../SectionHeading';
import { SectionProps } from './registry';

export const ContactSection: React.FC<SectionProps> = () => {
  const [beam, setBeam] = useState(0);
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm(() => setBeam((n) => n + 1));
  return (
    <div className="mb-contact">
      <div className="mb-contact__head">
        <SectionHeading kicker="Contact" title="Let's Connect" />
      </div>
      <ul className="mb-contact__rows">
        <li data-reveal><a className="mb-card mb-row" href={`mailto:${profile.email}`}><span>Email</span>{profile.email}</a></li>
        <li data-reveal><a className="mb-card mb-row" href={`tel:${profile.phone.replace(/\s/g, '')}`}><span>Phone</span>{profile.phone}</a></li>
        <li data-reveal><div className="mb-card mb-row"><span>Location</span>{profile.location}</div></li>
        <li data-reveal><a className="mb-card mb-row" href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span>sudhir-vishwakarma</a></li>
      </ul>
      <form className="mb-form mb-card" onSubmit={handleSubmit} data-reveal>
        <label>Your Name<input type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" /></label>
        <label>Your Email<input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" /></label>
        <label>Subject
          <select name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">Select Subject</option>
            <option value="project">Project Inquiry</option>
            <option value="job">Job Opportunity</option>
            <option value="collaboration">Collaboration</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>Your Message<textarea name="message" rows={5} value={form.message} onChange={handleChange} required /></label>
        {error && <p className="mb-form__error" role="alert">{error}</p>}
        <button type="submit" className="mb-btn" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
        {beam > 0 && <span key={beam} className="mb-beam" aria-hidden="true" />}
      </form>
      {showToast && <div className="mb-toast" role="status">✅ Message sent successfully! I'll respond within 24 hours.</div>}
    </div>
  );
};
