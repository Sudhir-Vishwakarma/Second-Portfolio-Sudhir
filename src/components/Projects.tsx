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
  // const [filter, setFilter] = useState<string>('All');
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
      title: 'Harmony Infra Ventures',
      shortDescription: 'Real Estate Platform for Seamless Property Buying and Selling',
      description: 'Engineered a high-performance real estate platform enabling seamless property buying and selling, leveraging Next.js and React for dynamic rendering, integrated with Strapi CMS and optimized APIs to deliver scalable listings and lightning-fast user experiences.',
      technologies: ['Next.JS', 'React', 'MySQL', 'Strapi', ' API Integration ' , 'Webpack', 'Tailwind CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://harmonyinfraventures.com/'
    },
    {
      title: 'Darsh Group',
      shortDescription: 'Online Property Marketplace for Efficient Buying and Selling Experience',
      description: 'Developed a robust property marketplace focused on intuitive buying and selling journeys, utilizing MySQL-backed data architecture, efficient API integration, and Tailwind CSS for a modern, responsive interface with smooth user interactions.',
      technologies: ['Next.JS', 'React', 'MySQL', 'Strapi', ' API Integration ' , 'Webpack', 'Tailwind CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://www.darshgroup.co.in/'
    },
    {
      title: 'Oriom Group',
      shortDescription: 'Real Estate Platform for Seamless Property Buying and Selling',
      description: 'Built a full-featured real estate web application with optimized property discovery and transaction flows, combining React-driven UI, Webpack optimization, and structured backend services to ensure performance, scalability, and clean data handling.',
      technologies: ['Next.JS', 'React', 'MySQL', 'Strapi', ' API Integration ' , 'Webpack', 'Tailwind CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://www.oriomgroup.com/'
    },
    {
      title: 'Eeshanya',
      shortDescription: 'End-to-End Real Estate Solution for Property Transactions and Listings',
      description: 'Designed an end-to-end property trading platform emphasizing speed, usability, and scalability, powered by Next.js SSR capabilities, Strapi content management, and modular API architecture for efficient listing management and seamless user engagement.',
      technologies: ['Next.JS', 'React', 'MySQL', 'Strapi', ' API Integration ' , 'Webpack', 'Tailwind CSS'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://www.eeshanya.com/'
    },
    {
      title: 'Space Group GRE',
      shortDescription: 'Site-visit lead capture tool for front-desk GREs, integrated with Salesforce',
      description: 'Tech Stack: PHP, Vanilla JS, Bootstrap 5, Salesforce Apex REST. Space Group GRE is an internal tool for front-desk staff (GREs) at project sites, rebuilt from an existing Next.js/React/Redux app in plain PHP so it no longer needs a Node build. Flow: Capture the walk-in lead → see matching leads from Salesforce → tag the site visit → fill in the enquiry form → Salesforce assigns a sales executive in turn → thank-you page, with a separate flow for updating an existing site visit. Key Highlights: Built about 10 JSON API endpoints that call Salesforce Apex methods for projects, channel partners, GRE executives, lead submission, site-visit tagging (for leads and opportunities) and getting or updating a site visit. Created a shared Salesforce client that fetches the OAuth2 token and retries when the session is invalid. Designed form fields that appear based on earlier answers (source → channel partner, customer category, loan help and referrals) along with a country-code picker. Kept the design stateless by passing data between pages as base64 JSON in the URL, as in the original app. Engineering: Built a mock Salesforce server and test script so the integration could be verified before real credentials existed. The app keeps working without credentials, rendering empty dropdowns instead of crashing.',
      technologies: ['PHP', 'JavaScript', 'Bootstrap 5', 'Salesforce Apex REST'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://gre.spacegroupco.com/'
    },
    {
      title: 'Space Group CP LP',
      shortDescription: 'Channel partner registration and lead submission landing page',
      description: 'Tech Stack: PHP, jQuery, jQuery Validate, Salesforce Apex REST, ContentVersion API. Space Group CP LP is a public landing page where brokers sign up as Space Group channel partners and register leads for buyers. Key Highlights: Built a channel partner registration form with about 25 fields covering firm details (name, type, GST, RERA, website, address), KYC (Aadhaar and contact details), bank details (account number and IFSC) and business profile (experience, monthly closures, marketing channels). Implemented KYC document upload for PAN, GST, bank proof, RERA and address proof (up to 8 MB per file, 40 MB total), working around the 6 MB Salesforce synchronous Apex limit by creating the record first and uploading each document separately as a Salesforce file (ContentVersion). Built lead registration where a partner submits a prospect against a project using their CP ID, with Salesforce validating the ID and rejecting duplicates. Security and Validation: Server-side validation for Indian mobile numbers, 12-digit Aadhaar, IFSC, email, project ID format and a mandatory RERA number, with POST-only requests, CSRF tokens and input sanitisation. The Salesforce client caches the OAuth token and refreshes it automatically when the session expires. Marketing Attribution: UTM, gclid and PPC channel, campaign and keyword values are stored in cookies for 30 days and sent with every lead. Logging and Reliability: Daily log files with a request ID on each line, captured warnings and fatal errors, masked Aadhaar, account numbers and tokens, 30-day retention and web-protected log files. Fallback logs preserve pending leads and partner sign-ups if Salesforce is unreachable.',
      technologies: ['PHP', 'jQuery', 'jQuery Validate', 'Salesforce Apex REST', 'ContentVersion API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://cp.spacegroupco.com/'
    },
    {
      title: 'Space Group Customer Portal',
      shortDescription: 'Self-service home buyer portal with bookings, payments and documents from Salesforce',
      description: 'Tech Stack: PHP 8, Tailwind CSS, Vanilla JS, Salesforce REST/SOQL, custom SMTP client. Space Group Customer Portal is a self-service portal for home buyers, built on the same design system as the CP Portal. Authentication: Passwordless sign-in with email and mobile followed by a 6-digit email code that expires after 10 minutes, allows 5 attempts, is checked with hash_equals, has a resend cooldown and regenerates the session ID after login. Customers are found by matching the Lead, then its converted Contact and Account, then Booking__c, with mobile numbers matched on the last 10 digits. Core Modules: Overview with total bookings, total value in ₹ with Indian number grouping and active bookings. My Bookings with a table and a tabbed side panel showing property, financial, team and date details from Booking and Unit records (typology, facing, MahaRERA). Printable A4 cost sheet and payment plan that can be saved as PDF. Payments with payment mode and payment-document tabs. Documents to view and download Salesforce files linked to the customer\'s bookings, Account, Contact or Lead. Construction updates with project progress images from Salesforce. Support form that emails the admin and creates a Salesforce Case linked to the customer. Security and Reliability: Ownership checks return a 404 if a customer tries to open another customer\'s cost sheet or document by changing the ID in the URL, and pages show an error banner during Salesforce outages instead of crashing. Testing: 202 unit checks across 15 test files, including outage, session, OTP and SMTP tests.',
      technologies: ['PHP 8', 'Tailwind CSS', 'JavaScript', 'Salesforce REST/SOQL', 'SMTP'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://customerportal.spacegroupco.com/login.php'
    },
    {
      title: 'Space Group Channel Partner Portal',
      shortDescription: 'Live Salesforce dashboard for channel partners to track leads and bookings',
      description: 'Tech Stack: PHP 8, Tailwind CSS, Vanilla JS, Salesforce REST/SOQL (API v61), custom SMTP client, Playwright. Space Group Channel Partner Portal is a logged-in dashboard where channel partners track their own business, pulled live from Salesforce. Core Modules: Overview with count-up stat cards, a Leads → Opportunities → Site Visits → Bookings funnel with conversion percentages, recent activity, and company and legal details. Dedicated pages for My Leads, Opportunities, Site Visits, Bookings and Support. Data tables with search, status filter, record count, a side panel with full record details, and rows that turn into cards on phones. Salesforce Integration: Data model of Leads → converted Opportunity → Booking__c, with paginated queries and escaped input. Sign-in by Channel Partner ID, where partners pick an account (and can switch later) if one ID matches several, with failed attempts limited per IP. Demo mode with sample data and one-click login so the client could review it before credentials arrived. Design System: Started as a dark neon glass theme based on the brand colours, then moved to a flat light theme that respects reduced-motion settings and works from 320 px phones upward. Hardening: HttpOnly/SameSite session cookies, .htaccess rules blocking direct access to config and include files, a keyboard-accessible side panel and support for hosting in a subfolder. Testing: 162 unit checks, an HTTP smoke-test script, and Playwright screenshots at phone and desktop widths.',
      technologies: ['PHP 8', 'Tailwind CSS', 'JavaScript', 'Salesforce REST/SOQL', 'Playwright'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://cpportal.spacegroupco.com/login.php'
    },
    {
      title: 'STARZAi CRM',
      shortDescription: 'Enterprise-grade multi-tenant CRM platform',
      description: 'Tech Stack: React (TypeScript), Vite, TailwindCSS, Firebase, Express.js, Google Cloud Run, Twilio, OpenAI. STARZ CRM is a full-scale, multi-tenant Customer Relationship Management platform built with a microservices architecture. It streamlines operations for clients and internal service teams through real-time analytics, automated workflows, and AI-powered tools. Key Highlights: Built a React + TypeScript front-end with a modular architecture, Context API state management, role-based routing, and an advanced theme system (light/dark mode). Developed backend microservices using Firebase Admin, OpenAI, and WhatsApp messaging, reminders, and data synchronization. Implemented Firebase Firestore as the primary database with phone-number-based authentication, OTP onboarding, and secure file storage. Architected a 20-role hierarchical user system (CEO → HR → BD → CS → Marketing → Design → Development), each with dedicated dashboards and permissions. Core Functional Modules: Dashboard & BI Analytics with real-time KPIs, lead scoring, revenue insights, interactive charts (Chart.js, Recharts). Lead & Customer Management with acquisition pipelines, segmentation (Basic/Advanced/Pro), CSV import/export. Campaign Suite with Meta Ads, WhatsApp automations, AI content creation, and landing page generator. Communication Tools including WhatsApp messaging, tasks, reminders, and Google Calendar event syncing. Project Management with Kanban board, task calendar, team performance tracking, and file approval workflows. AI Automation for content generation, analysis, and workflow automation using OpenAI. Engineering & Deployment: Frontend deployed on Vercel with optimized Vite builds. Backend services containerized with Docker and deployed on Google Cloud Run with CI/CD via Cloud Build. Ensured platform security with role-based access, SSL/TLS, CORS rules, and environment-based configuration.',
      technologies: ['React', 'Next' , 'TypeScript', 'Firebase', 'Google Cloud', 'REST API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://crm.starz.vip',
      featured: true
    },
    {
      title: 'Shubhdhanam CRM',
      shortDescription: 'Financial CRM for loan management',
      description: 'Tech Stack: React (TypeScript), Vite, TailwindCSS, Firebase/Firestore, Chart.js, React Hook Form, ExcelJS, WhatsApp Webhooks. Shubhdhanam CRM is a full-scale financial CRM built for loan management, lead operations, pipeline tracking, and automated commission processing across multiple user roles, with real-time performance and strong data integrity. Key Highlights: Built a modular React + TypeScript frontend with real-time UI, secure routing, and mobile-first responsive layout. Developed a multi-role hierarchy (Admin → Coordinator → Partner → Agent → Telecaller → Connector → Customer Connector) with strict data isolation and RBAC. Implemented phone OTP login, partner codes, and admin-driven onboarding with Firebase Auth & Firestore. Designed end-to-end lead management with QR capture, bulk imports, deduplication, ownership tracking, and auto-assignment. Created a structured pipeline (Login Pending → Login → In Process → Underwriting → Approval → Disbursement/Rejection) with controlled transitions. Core Modules: Lead & Pipeline with multi-source leads, dedupe system, real-time updates, assignment flow, hierarchy visibility. Commission Engine with automated payouts with slabs, bonuses, thresholds, and live tracking for all role types. Analytics with dashboards featuring revenue trends, pipeline charts, source insights, and team performance. Communication including WhatsApp webhooks, internal chat, marketing banners, and QR-based lead pages. Data Ops with XLSX exports, document uploads, QR Code Lead Generation. Engineering & Architecture: Real-Time with Firestore listeners for instant pipeline, payout, dashboard updates. Secure with OTP login, RBAC, audit logs, and encrypted workflows. Optimized Frontend with Tailwind dark mode, reusable components, custom hooks, clean UI logic, Vite builds. Business Workflow: Lead Generation → Assignment → Pipeline Tracking → Deal Closure → Commission Calculation → Payouts.',
      technologies: ['React', 'Next' , 'TypeScript', 'Tailwind CSS', 'Firebase', 'REST API'],
      status: 'Completed',
      type: 'Web App',
      demoUrl: 'https://crm.shubhdhanam.com/dashboard',
      featured: true
    },
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