import React, { useState, useEffect } from 'react';
import './Projects.css';

interface Project {
  title: string;
  description: string;
  shortDescription: string;
  technologies: string[];
  status: 'Completed' | 'In Progress' | 'Planning';
  type: 'Web App' | 'Mobile App' | 'API' | 'Library' | 'Desktop App';
  demoUrl?: string;
  codeUrl?: string;
  featured?: boolean;
}

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const projects: Project[] = [
    {
      title: 'Weather App',
      shortDescription: 'Interactive weather application with real-time data',
      description: 'A responsive weather application built with vanilla JavaScript that provides real-time weather information. Features include current weather conditions, location-based forecasts, and clean user interface design.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/weatherApp-JS/',
      featured: true
    },
    {
      title: 'Calendar App',
      shortDescription: 'Dynamic calendar with event management',
      description: 'A fully functional calendar application with event management capabilities. Built using vanilla JavaScript with intuitive date navigation and event scheduling features.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/calendarApp-JS/'
    },
    {
      title: 'Random User Generator',
      shortDescription: 'API-powered random user profile generator',
      description: 'A user profile generator that fetches random user data from external APIs. Demonstrates API integration, async/await functionality, and dynamic content rendering.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/Random-User-Generator-JS/'
    },
    {
      title: 'Random Quote Generator (React)',
      shortDescription: 'React-based inspirational quote generator',
      description: 'A React-based quote generator featuring useState hooks, async/await functions, arrow functions, Math.floor(), Math.random(), third-party API integration, and array destructuring. Deployed on Firebase.',
      technologies: ['React', 'JavaScript', 'API', 'Firebase'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://random-user-generator-re-49355.web.app/',
      featured: true
    },
    {
      title: 'Quiz App (React)',
      shortDescription: 'Interactive quiz application built with React',
      description: 'A comprehensive quiz application built with React.js featuring multiple question types, score tracking, and responsive design. Deployed on Firebase for optimal performance.',
      technologies: ['React', 'JavaScript', 'Firebase'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://quizapp-react-421dd.web.app/'
    },
    {
      title: 'Quiz App (Vanilla JS)',
      shortDescription: 'JavaScript quiz app with advanced features',
      description: 'A feature-rich quiz application built with HTML, CSS, and JavaScript. Includes media queries, normal and arrow functions, array inside objects, dynamic styling with JS, event listeners, forEach loops, and Array.from concepts.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/QuizApp-JS/'
    },
    {
      title: 'Note App',
      shortDescription: 'Personal note-taking application',
      description: 'A simple yet effective note-taking application with local storage capabilities. Features include note creation, editing, deletion, and persistent storage using browser localStorage.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/NoteApp-JS/'
    },
    {
      title: 'Landing Page',
      shortDescription: 'Modern responsive landing page',
      description: 'A professionally designed landing page with modern UI/UX principles. Features responsive design, smooth animations, and interactive elements built with vanilla web technologies.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/Landing-Page-JS/'
    },
    {
      title: 'Interior Decorator',
      shortDescription: 'React-based interior design platform',
      description: 'A comprehensive interior design platform built with React and Firebase. Features include email/password and Google authentication, media queries, flexbox layouts, and React hooks. Integrated with Firebase for backend services.',
      technologies: ['React', 'Firebase', 'JavaScript', 'CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://svimla-interior.firebaseapp.com/',
      featured: true
    },
    {
      title: 'Image Search App',
      shortDescription: 'API-powered image search engine',
      description: 'An image search application with API integration. Features include event listeners, map methods, createElement, appendChild, async/await, fetch API, CSS Grid, and Flexbox layouts.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/Image-Search-JS/'
    },
    {
      title: 'Expense Tracker',
      shortDescription: 'Personal finance management tool',
      description: 'A comprehensive expense tracking application featuring Flexbox and Grid layouts, event listeners, for-in loops, array and string methods, and various JavaScript properties for financial management.',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://sudhir-vishwakarma.github.io/Expense-Tracker-JS/'
    },
    {
      title: 'Crypto Currency App',
      shortDescription: 'Real-time cryptocurrency tracker',
      description: 'A React.js cryptocurrency tracking application with CoinGecko API integration. Features latest crypto updates, function components with arrow functions, responsive design, React hooks, and GitHub integration.',
      technologies: ['React', 'JavaScript', 'CoinGecko API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://crypto-currency-7bptqvbdg-sudhir-vishwakarmas-projects.vercel.app/',
      featured: true
    },
    {
      title: 'Digital Kundali',
      shortDescription: 'TypeScript-based digital assessment platform',
      description: 'A comprehensive digital assessment platform built with TypeScript and React. Features user input forms, checklist-based benchmarks, DIBIL Score calculation out of 100, visual progress representation, and CRM integration for consultation leads.',
      technologies: ['TypeScript', 'React', 'JavaScript', 'Webpack', 'Tailwind CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://kundali.starz.vip/'
    },
    {
      title: 'STARZAi CRM',
      shortDescription: 'Enterprise-grade multi-tenant CRM platform',
      description: 'Tech Stack: React (TypeScript), Vite, TailwindCSS, Firebase, Express.js, Google Cloud Run, Twilio, OpenAI. STARZ CRM is a full-scale, multi-tenant Customer Relationship Management platform built with a microservices architecture. It streamlines operations for clients and internal service teams through real-time analytics, automated workflows, and AI-powered tools. Key Highlights: Built a React + TypeScript front-end with a modular architecture, Context API state management, role-based routing, and an advanced theme system (light/dark mode). Developed backend microservices using Firebase Admin, OpenAI, and WhatsApp messaging, reminders, and data synchronization. Implemented Firebase Firestore as the primary database with phone-number-based authentication, OTP onboarding, and secure file storage. Architected a 20-role hierarchical user system (CEO → HR → BD → CS → Marketing → Design → Development), each with dedicated dashboards and permissions. Core Functional Modules: Dashboard & BI Analytics with real-time KPIs, lead scoring, revenue insights, interactive charts (Chart.js, Recharts). Lead & Customer Management with acquisition pipelines, segmentation (Basic/Advanced/Pro), CSV import/export. Campaign Suite with Meta Ads, WhatsApp automations, AI content creation, and landing page generator. Communication Tools including WhatsApp messaging, tasks, reminders, and Google Calendar event syncing. Project Management with Kanban board, task calendar, team performance tracking, and file approval workflows. AI Automation for content generation, analysis, and workflow automation using OpenAI. Engineering & Deployment: Frontend deployed on Vercel with optimized Vite builds. Backend services containerized with Docker and deployed on Google Cloud Run with CI/CD via Cloud Build. Ensured platform security with role-based access, SSL/TLS, CORS rules, and environment-based configuration.',
      technologies: ['React', 'TypeScript', 'Firebase', 'Google Cloud', 'REST API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://crm.starz.vip',
      featured: true
    },
    {
      title: 'Shubhdhanam CRM',
      shortDescription: 'Financial CRM for loan management',
      description: 'Tech Stack: React (TypeScript), Vite, TailwindCSS, Firebase/Firestore, Chart.js, React Hook Form, ExcelJS, WhatsApp Webhooks. Shubhdhanam CRM is a full-scale financial CRM built for loan management, lead operations, pipeline tracking, and automated commission processing across multiple user roles, with real-time performance and strong data integrity. Key Highlights: Built a modular React + TypeScript frontend with real-time UI, secure routing, and mobile-first responsive layout. Developed a multi-role hierarchy (Admin → Coordinator → Partner → Agent → Telecaller → Connector → Customer Connector) with strict data isolation and RBAC. Implemented phone OTP login, partner codes, and admin-driven onboarding with Firebase Auth & Firestore. Designed end-to-end lead management with QR capture, bulk imports, deduplication, ownership tracking, and auto-assignment. Created a structured pipeline (Login Pending → Login → In Process → Underwriting → Approval → Disbursement/Rejection) with controlled transitions. Core Modules: Lead & Pipeline with multi-source leads, dedupe system, real-time updates, assignment flow, hierarchy visibility. Commission Engine with automated payouts with slabs, bonuses, thresholds, and live tracking for all role types. Analytics with dashboards featuring revenue trends, pipeline charts, source insights, and team performance. Communication including WhatsApp webhooks, internal chat, marketing banners, and QR-based lead pages. Data Ops with XLSX exports, document uploads, QR Code Lead Generation. Engineering & Architecture: Real-Time with Firestore listeners for instant pipeline, payout, dashboard updates. Secure with OTP login, RBAC, audit logs, and encrypted workflows. Optimized Frontend with Tailwind dark mode, reusable components, custom hooks, clean UI logic, Vite builds. Business Workflow: Lead Generation → Assignment → Pipeline Tracking → Deal Closure → Commission Calculation → Payouts.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Firebase', 'REST API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://crm.shubhdhanam.com/dashboard',
      featured: true
    }
  ];

  const filteredProjects = projects.reverse();


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
                {selectedProject.description.split('. ').map((sentence, index) => (
                  sentence.trim() && (
                    <p key={index} className="description-paragraph">
                      {sentence.trim()}{sentence.includes(':') || index === selectedProject.description.split('. ').length - 1 ? '' : '.'}
                    </p>
                  )
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