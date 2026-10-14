import React from 'react';
import { profile } from '../../../data/portfolio';
import { useContactForm } from '../../../hooks/contact';
import { useJourney } from '../../store';
import { PanelProps } from './index';

export const ContactPanel: React.FC<PanelProps> = () => {
  const fireBeam = useJourney((s) => s.fireBeam);
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm(() => fireBeam());
  return (
    <div>
      <span className="mv-kicker">Contact</span>
      <h2 className="mv-h2">Let's Connect</h2>
      <ul className="mv-contact">
        <li><span>Email</span><a href={`mailto:${profile.email}`}>{profile.email}</a></li>
        <li><span>Phone</span><a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a></li>
        <li><span>Location</span>{profile.location}</li>
        <li><span>LinkedIn</span><a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">sudhir-vishwakarma</a></li>
      </ul>
      <form className="mv-form" onSubmit={handleSubmit}>
        <div className="mv-form__row">
          <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required aria-label="Your name" />
          <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required aria-label="Your email" />
        </div>
        <select name="subject" value={form.subject} onChange={handleChange} required aria-label="Subject">
          <option value="">Select Subject</option>
          <option value="project">Project Inquiry</option>
          <option value="job">Job Opportunity</option>
          <option value="collaboration">Collaboration</option>
          <option value="other">Other</option>
        </select>
        <textarea name="message" placeholder="Your Message" rows={4} value={form.message} onChange={handleChange} required aria-label="Your message" />
        {error && <p className="mv-form__error" role="alert">{error}</p>}
        <button type="submit" className="mv-btn" disabled={sending}>{sending ? 'Transmitting…' : 'Send Message'}</button>
      </form>
      {showToast && <div className="mv-toast" role="status">✅ Message sent successfully! I'll respond within 24 hours.</div>}
    </div>
  );
};
