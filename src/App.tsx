import React, { Suspense, lazy, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import './App.css';

// Prototype 3D "multiverse" experience at /#lab (loaded only when visited)
const Lab = lazy(() => import('./lab/Lab'));

type ActiveSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLab, setIsLab] = useState(window.location.hash === '#lab');

  useEffect(() => {
    const onHash = () => setIsLab(window.location.hash === '#lab');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const handleSectionChange = (section: ActiveSection) => {
    if (section === activeSection) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 100);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home': return <Dashboard />;
      case 'about': return <About />;
      case 'work': return <Skills />;
      case 'projects': return <Projects />;
      case 'contacts': return <Contact />;
      default: return <Dashboard />;
    }
  };

  if (isLab) {
    return (
      <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#000' }} />}>
        <Lab />
      </Suspense>
    );
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
      />
      <main className={`main-content ${isTransitioning ? 'genie-out' : 'genie-in'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;