import React, { useState, useEffect } from 'react';
import './Skills.css';

const Skills: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="skills-page">
      <h1 className="section-title">Work Experience</h1>
      
      <div className={`experience-section ${isVisible ? 'animate-in' : ''}`}>
        <div className="experience-list">
          <div className="experience-item">
            <h4>Frontend Developer - Starz Ventures Pvt Ltd</h4>
            <p className="experience-period">2025 - Present</p>
            <ul className="experience-points">
              <li>Developed high-performance web applications using front-end technologies with responsive UI</li>
              <li>Created and deployed a custom Serverless Middleware REST API on Google Cloud</li>
              <li>Integrated multiple APIs to improve data flow and system reliability across the app</li>
              <li>Managed Firebase Database to securely handle and sync client data in real time</li>
              <li>Collaborated with teams to troubleshoot, optimize workflows, and deliver production-ready solutions</li>
            </ul>
          </div>
          <div className="experience-item">
            <h4>Frontend Developer - Entrance1.com</h4>
            <p className="experience-period">2019 - 2020</p>
            <ul className="experience-points">
              <li>Built responsive and user-friendly UI components using modern front-end technologies</li>
              <li>Converted design mockups into clean, pixel-perfect web interfaces for improved UX</li>
              <li>Optimized front-end performance by enhancing layouts and reducing load times</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;