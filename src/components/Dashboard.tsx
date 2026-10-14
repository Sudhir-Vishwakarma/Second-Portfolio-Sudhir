import React, { useEffect, useState } from 'react';
import { profile } from '../data/portfolio';
import { useTypewriter } from '../hooks/typewriter';
import SocialIcons from './SocialIcons';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const currentText = useTypewriter(profile.typingWords);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="dashboard">
      <div className="hero-split">
        <div className="hero-left">
          <div className={`hero-content ${isVisible ? 'animate-in' : ''}`}>
            <span className="greeting">{profile.greeting}</span>
            <h1 className="name">{profile.firstName}<br />{profile.lastName}</h1>
            <p className="title">{profile.titlePrefix} <span className="highlight glow-text">{currentText}</span><span className="cursor">|</span></p>
            <p className="description">{profile.bio}</p>
            <div className="action-buttons">
              <button className="cta-btn" onClick={() => setShowResumeModal(true)}>VIEW CV</button>
            </div>
            <SocialIcons />
          </div>
        </div>
        <div className="hero-right">
          <div className="background-effects">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
          </div>
          <div className={`hero-image ${isVisible ? 'animate-in' : ''}`}>
            <img src={profile.photo} alt={`${profile.firstName} ${profile.lastName}`} />
          </div>
        </div>
      </div>

      {showResumeModal && (
        <div className="resume-modal" onClick={() => setShowResumeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowResumeModal(false)}>×</button>
            <div className="resume-header">
              <h3>My Resume</h3>
              <a href={profile.cvUrl} download={profile.cvDownloadName} className="download-btn">
                Download PDF
              </a>
            </div>
            <div className="pdf-viewer">
              <iframe src={`${profile.cvUrl}#toolbar=1&navpanes=0&scrollbar=1`} width="100%" height="600px" title="Resume">
                <p>Your browser does not support PDFs. <a href={profile.cvUrl}>Download the PDF</a>.</p>
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
