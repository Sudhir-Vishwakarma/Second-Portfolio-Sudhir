import React, { useState, useEffect } from 'react';
import './About.css';

const About: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const certificates = [
    { title: 'HTML5 Application Development Fundamentals', provider: 'Great Learning', image: '/Images/HTML.png' },
    { title: 'Introduction to Programming Using JavaScript', provider: 'Great Learning', image: '/Images/Javascript.png' },
    { title: 'Programming in CSS3', provider: 'Great Learning', image: '/Images/CSS.png' },
    { title: 'ReactJS', provider: 'Great Learning', image: '/Images/Reactjs.png' }
  ];

  const openCertificate = (image: string) => {
    setSelectedCertificate(image);
  };

  const closeCertificate = () => {
    setSelectedCertificate(null);
  };

  return (
    <div className="about-page">
      <h1 className="section-title">About Me</h1>
      
      <div className="about-grid">
        <div className={`about-intro ${isVisible ? 'animate-in' : ''}`}>
          <h3>About Me</h3>
          <p>Hello, I'm a Front-End UI Developer. Coding on React and dreaming on ReactJS+ more technologies. Help Companies to build complex Web Applications and want to serve 1,00,000+ users with React and Modern Technologies.</p>
        </div>

        <div className={`skills-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Technical Skills</h3>
          <div className="skills-tags">
            <span className="skill-tag">Next.js</span>
            <span className="skill-tag">TypeScript</span>
            <span className="skill-tag">NodeJS</span>
            <span className="skill-tag">ExpressJS</span>
            <span className="skill-tag">React/Redux</span>
            <span className="skill-tag">JavaScript</span>
            <span className="skill-tag">Bootstrap</span>
            <span className="skill-tag">Firebase</span>
            <span className="skill-tag">Git</span>
            <span className="skill-tag">PHP</span>
            <span className="skill-tag">MongoDB</span>
            <span className="skill-tag">MySQL</span>
            <span className="skill-tag">C/C++</span>
            <span className="skill-tag">Google Cloud Server</span>
            <span className="skill-tag">Middleware Serverless REST API</span>
            <span className="skill-tag">API</span>
          </div>
        </div>

        <div className={`education-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Education</h3>
          <div className="education-list">
            <div className="education-item">
              <div className="edu-year">2022 - 2023</div>
              <div className="edu-content">
                <h4>Web-Development Front-End</h4>
                <p>Great Learning</p>
              </div>
            </div>
            <div className="education-item">
              <div className="edu-year">2013 - 2016</div>
              <div className="edu-content">
                <h4>E-Commerce/Electronic Commerce</h4>
                <p>Nirmala Memorial Foundation College of Commerce & Science</p>
              </div>
            </div>
            <div className="education-item">
              <div className="edu-year">2011 - 2013</div>
              <div className="edu-content">
                <h4>HSC</h4>
                <p>Shree MumbaiDevi Junior College</p>
              </div>
            </div>
            <div className="education-item">
              <div className="edu-year">1999 - 2010</div>
              <div className="edu-content">
                <h4>SSC</h4>
                <p>Shree Raghuveer English High School</p>
              </div>
            </div>
          </div>
        </div>



        <div className={`certifications-section ${isVisible ? 'animate-in' : ''}`}>
          <h3>Certifications</h3>
          <div className="cert-list">
            {certificates.map((cert, index) => (
              <div key={index} className="cert-item">
                <div className="cert-content">
                  <h4>{cert.title}</h4>
                  <p>{cert.provider}</p>
                </div>
                <div className="cert-actions">
                  <button 
                    className="cert-btn view-btn"
                    onClick={() => openCertificate(cert.image)}
                  >
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
        <div className="certificate-modal" onClick={closeCertificate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCertificate}>×</button>
            <img src={selectedCertificate} alt="Certificate" className="certificate-image" />
          </div>
        </div>
      )}
    </div>
  );
};

export default About;