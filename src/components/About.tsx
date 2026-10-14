import React, { useState, useEffect } from 'react';
import { aboutSummary, skills, education, certifications } from '../data/portfolio';
import './About.css';

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="about-page">
      <h1 className="section-title">About Me</h1>

      <div className="about-grid">
        <div className={`about-intro ${isVisible ? 'animate-in' : ''}`}>
          <h3>About Me</h3>
          <p>{aboutSummary}</p>
        </div>

        <div className={`skills-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Technical Skills</h3>
          <div className="skills-tags">
            {skills.map((s) => (
              <span key={s.name} className="skill-tag">{s.name}</span>
            ))}
          </div>
        </div>

        <div className={`education-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Education</h3>
          <div className="education-list">
            {education.map((e) => (
              <div key={e.years} className="education-item">
                <div className="edu-year">{e.years}</div>
                <div className="edu-content">
                  <h4>{e.title}</h4>
                  <p>{e.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`certifications-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Certifications</h3>
          <div className="cert-list">
            {certifications.map((cert) => (
              <div key={cert.title} className="cert-item">
                <div className="cert-content">
                  <h4>{cert.title}</h4>
                  <p>{cert.provider}</p>
                </div>
                <div className="cert-actions">
                  <button className="cert-btn view-btn" onClick={() => setSelectedCertificate(cert.pdf || cert.image)}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {selectedCertificate && (
        <div className="certificate-modal" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCertificate(null)}>×</button>
            {selectedCertificate.endsWith('.pdf') ? (
              <iframe src={selectedCertificate} title="Certificate" className="certificate-image" style={{ width: '80vw', height: '80vh', border: 0 }} />
            ) : (
              <img src={selectedCertificate} alt="Certificate" className="certificate-image" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
