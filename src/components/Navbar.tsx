import React from 'react';

interface NavbarProps {
  onNavigate?: (view: 'home' | 'privacy' | 'terms', sectionId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const handleNavClick = (id: string) => {
    if (onNavigate) {
      onNavigate('home', id);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="glass-nav">
      {/* Brand Logo */}
      <div className="nav-logo" onClick={() => handleNavClick('hero')}>
        <span
          className="nav-logo-icon"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.15rem',
          }}
        >
          S
        </span>
        <span>Survey<span style={{ color: 'var(--primary)' }}>Website</span></span>
      </div>

      {/* Navigation Links */}
      <div className="nav-links">
        <button onClick={() => handleNavClick('hero')} className="nav-link-btn">
          Home
        </button>
        <button onClick={() => handleNavClick('survey')} className="nav-link-btn">
          Survey
        </button>
        <button onClick={() => handleNavClick('about')} className="nav-link-btn">
          About
        </button>
      </div>
    </nav>
  );
};

