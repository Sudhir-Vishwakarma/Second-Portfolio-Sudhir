import React, { useState } from 'react';
import { HiHome, HiUser, HiBriefcase, HiCollection, HiMail } from 'react-icons/hi';
import './Sidebar.css';

type ActiveSection = 'home' | 'about' | 'work' | 'projects' | 'contacts';

interface SidebarProps {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: HiHome },
    { id: 'about', label: 'About', icon: HiUser },
    { id: 'work', label: 'Work', icon: HiBriefcase },
    { id: 'projects', label: 'Projects', icon: HiCollection },
    { id: 'contacts', label: 'Contacts', icon: HiMail }
  ];

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
      </nav>
    </aside>
  );
};

export default Sidebar;