import React, { useState, useEffect } from 'react';
import './Projects.css';
import { projects, newestFirst, descriptionParagraphs, Project } from '../data/portfolio';

const Projects: React.FC = () => {
  // const [filter, setFilter] = useState<string>('All');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  

  const filteredProjects = newestFirst(projects);


  const openModal = (project: Project) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1 className={`section-title ${isVisible ? 'animate-in' : ''}`}>My Projects</h1>
        {/* <p className="projects-subtitle">A collection of {projects.length} innovative solutions I've built</p> */}
      </div>
      

      

      
      <div className="projects-showcase">
        {filteredProjects.map((project, index) => (
          <div 
            key={index} 
            className={`project-card ${isVisible ? 'animate-in' : ''} ${project.featured ? 'featured-project' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="project-header">
              <div className="project-title-section">
                <h3>{project.title}</h3>
                <span className="project-type">{project.type}</span>
              </div>
              <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            
            <p className="project-description">{project.shortDescription}</p>
            
            <button 
              className="read-more-btn"
              onClick={() => openModal(project)}
            >
              Read More
            </button>
            
            <div className="project-tech">
              {project.technologies.slice(0, 3).map((tech, i) => (
                <span key={i} className="tech-badge">{tech}</span>
              ))}
              {project.technologies.length > 3 && (
                <span className="tech-badge more">+{project.technologies.length - 3}</span>
              )}
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
      
      {selectedProject && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-header">
              <h2>{selectedProject.title}</h2>
              <span className="project-type">{selectedProject.type}</span>
              <span className={`status-badge ${selectedProject.status.toLowerCase().replace(' ', '-')}`}>
                {selectedProject.status}
              </span>
            </div>
            <div className="modal-body">
              <div className="description-content">
                {descriptionParagraphs(selectedProject.description).map((p, index) => (
                  <p key={index} className="description-paragraph">{p}</p>
                ))}
              </div>
              <div className="project-tech">
                {selectedProject.technologies.map((tech, i) => (
                  <span key={i} className="tech-badge">{tech}</span>
                ))}
              </div>
              <div className="project-actions">
                {selectedProject.demoUrl && (
                  <a href={selectedProject.demoUrl} className="btn">Live Demo</a>
                )}
                {selectedProject.codeUrl && (
                  <a href={selectedProject.codeUrl} className="btn btn-outline">Code</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;