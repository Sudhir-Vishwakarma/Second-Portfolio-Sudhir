import React, { useState, useEffect } from 'react';
import { experience } from '../data/portfolio';
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
          {experience.map((job) => (
            <div key={job.company} className="experience-item">
              <div className="exp-left">
                <h4>{job.role} - {job.company}</h4>
              </div>
              <div className="exp-middle">
                <p>{job.start} - {job.end}</p>
              </div>
              <div className="exp-right">
                <ul>
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;
