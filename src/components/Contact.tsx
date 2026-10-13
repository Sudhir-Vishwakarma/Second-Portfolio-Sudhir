import React, { useState } from 'react';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showToast, setShowToast] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send your message. Please email me directly.');

      // Show toaster
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Clear form fields
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please email me directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <h1 className="section-title">Let's Connect</h1>
      
      <div className="contact-grid">
        <div className="contact-info">
          <div className="info-card">
            <h3>📧 Email</h3>
            <p>karmasudhir48@gmail.com</p>
          </div>
          <div className="info-card">
            <h3>📱 Phone</h3>
            <p>+91 7710945924</p>
          </div>
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>Mumbai, India</p>
          </div>
          <div className="info-card">
            <h3>🔗 LinkedIn</h3>
            <p>https://www.linkedin.com/in/sudhir-vishwakarma-6b660017b/</p>
          </div>
        </div>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send me a message</h3>
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select Subject</option>
            <option value="project">Project Inquiry</option>
            <option value="job">Job Opportunity</option>
            <option value="collaboration">Collaboration</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="message"
            placeholder="Your Message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
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