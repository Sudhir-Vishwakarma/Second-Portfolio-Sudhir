import React from 'react';
import './Skills.css';

interface Skill {
  name: string;
  level: number;
  category: string;
}

const Skills: React.FC = () => {
  const skills: Skill[] = [
    { name: 'React', level: 90, category: 'Frontend' },
    { name: 'TypeScript', level: 85, category: 'Frontend' },
    { name: 'JavaScript', level: 95, category: 'Frontend' },
    { name: 'Node.js', level: 80, category: 'Backend' },
    { name: 'Python', level: 75, category: 'Backend' },
    { name: 'MongoDB', level: 70, category: 'Database' },
    { name: 'AWS', level: 65, category: 'Cloud' },
    { name: 'Docker', level: 60, category: 'DevOps' }
  ];

  const categories = ['Frontend', 'Backend', 'Database', 'Cloud', 'DevOps'];

  return (
    <div className="skills-page">
      <h1 className="section-title">Technical Skills</h1>
      
      <div className="skills-categories">
        {categories.map(category => (
          <div key={category} className="skill-category">
            <h3>{category}</h3>
            <div className="category-skills">
              {skills
                .filter(skill => skill.category === category)
                .map((skill, index) => (
                  <div key={index} className="skill-card">
                    <div className="skill-info">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-progress" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skills;