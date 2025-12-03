import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'messages'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        timestamp: new Date(),
        read: false
      });
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Failed to send message. Please try again.');
    }
    
    setLoading(false);
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
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>Your City, Country</p>
          </div>
          <div className="info-card">
            <h3>🔗 LinkedIn</h3>
            <p>linkedin.com/in/yourprofile</p>
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
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Message'}
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