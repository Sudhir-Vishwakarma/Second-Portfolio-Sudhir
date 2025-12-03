import React, { useState } from 'react';
import { HiHome, HiUser, HiBriefcase, HiCollection, HiMail, HiLogout } from 'react-icons/hi';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Sidebar.css';

type ActiveSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: HiHome },
    { id: 'about', label: 'About', icon: HiUser },
    { id: 'work', label: 'Work', icon: HiBriefcase },
    { id: 'projects', label: 'Projects', icon: HiCollection },
    { id: 'contacts', label: 'Contacts', icon: HiMail }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside 
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id as ActiveSection)}
          >
            <item.icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
        
        <button
          className="nav-item logout-btn"
          onClick={handleLogout}
        >
          <HiLogout className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;