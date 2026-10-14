import React from 'react';
import { profile } from '../data/portfolio';
import { useContactForm } from '../hooks/contact';
import './Contact.css';

const Contact: React.FC = () => {
  const { form, sending, error, showToast, handleChange, handleSubmit } = useContactForm();

  return (
    <div className="contact-page">
      <h1 className="section-title">Let's Connect</h1>

      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card">
            <h3>📧 Email</h3>
            <p>{profile.email}</p>
          </div>
          <div className="info-card">
            <h3>📱 Phone</h3>
            <p>{profile.phone}</p>
          </div>
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>{profile.location}</p>
          </div>
          <div className="info-card">
            <h3>🔗 LinkedIn</h3>
            <p>{profile.linkedinUrl}</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send me a message</h3>
          <div className="form-row">
            <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Your Email" value={form.email} onChange={handleChange} required />
          </div>
          <select name="subject" value={form.subject} onChange={handleChange} required>
            <option value="">Select Subject</option>
            <option value="project">Project Inquiry</option>
            <option value="job">Job Opportunity</option>
            <option value="collaboration">Collaboration</option>
            <option value="other">Other</option>
          </select>
          <textarea name="message" placeholder="Your Message" rows={6} value={form.message} onChange={handleChange} required></textarea>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {showToast && (
        <div className="toast">
          ✅ Message sent successfully! I'll respond within 24 hours.
        </div>
      )}
    </div>
  );
};

export default Contact;
