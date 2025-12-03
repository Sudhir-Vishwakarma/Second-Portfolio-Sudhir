import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Auth from './components/Auth';
import './firebase';
import './App.css';

type ActiveSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSectionChange = (section: ActiveSection) => {
    if (section === activeSection) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 100);
  };

  const handleAuthSuccess = () => {
    setActiveSection('home');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSection('home');
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={handleSectionChange}
        onLogout={handleLogout}
      />
      <main className={`main-content ${isTransitioning ? 'genie-out' : 'genie-in'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;