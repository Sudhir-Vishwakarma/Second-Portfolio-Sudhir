import React, { useState, useEffect } from 'react';
import './Projects.css';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  status: 'Completed' | 'In Progress' | 'Planning';
  type: 'Web App' | 'Mobile App' | 'API' | 'Library';
  demoUrl?: string;
  codeUrl?: string;
}

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [isVisible, setIsVisible] = useState(false);
  
  const projects: Project[] = [
    {
      title: 'E-Commerce Platform',
      description: 'Full-stack e-commerce with payment integration and admin dashboard',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: '#',
      codeUrl: '#'
    },
    {
      title: 'Task Management System',
      description: 'Real-time collaborative task management with team features',
      technologies: ['React', 'TypeScript', 'Socket.io', 'PostgreSQL'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: '#',
      codeUrl: '#'
    },
    {
      title: 'REST API Framework',
      description: 'Scalable REST API with authentication and rate limiting',
      technologies: ['Node.js', 'Express', 'JWT', 'Redis'],
      status: 'In Progress',
      type: 'API',
      codeUrl: '#'
    },
    {
      title: 'Mobile Weather App',
      description: 'Cross-platform weather app with location services',
      technologies: ['React Native', 'TypeScript', 'Weather API'],
      status: 'Planning',
      type: 'Mobile App'
    }
  ];

  const filters = ['All', 'Web App', 'Mobile App', 'API', 'Library'];
  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.type === filter);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="projects-page">
      <h1 className={`section-title ${isVisible ? 'animate-in' : ''}`}>My Projects</h1>
      
      <div className={`project-filters ${isVisible ? 'animate-in' : ''}`}>
        {filters.map((filterType, index) => (
          <button
            key={filterType}
            className={`filter-btn ${filter === filterType ? 'active' : ''}`}
            onClick={() => setFilter(filterType)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {filterType}
          </button>
        ))}
      </div>
      
      <div className="projects-grid">
        {filteredProjects.map((project, index) => (
          <div 
            key={index} 
            className={`project-card ${isVisible ? 'animate-in' : ''}`}
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="project-header">
              <h3>{project.title}</h3>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-tech">
              {project.technologies.map((tech, i) => (
                <span key={i} className="tech-badge">{tech}</span>
              ))}
            </div>
            <div className="project-actions">
              {project.demoUrl && (
                <a href={project.demoUrl} className="btn">Live Demo</a>
              )}
              {project.codeUrl && (
                <a href={project.codeUrl} className="btn btn-outline">Code</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;