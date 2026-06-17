import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { Menu, User, ShieldCheck, Sun, Moon } from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  adminEmail?: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  onLogout,
  adminEmail,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark'));

  // Quick theme toggle on topbar
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  };

  // Convert pathname to title
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/admin': return 'Overview';
      case '/admin/responses': return 'Survey Responses';
      case '/admin/analytics': return 'Analytics Reports';
      case '/admin/business': return 'Business Venture Insights';
      case '/admin/settings': return 'System Settings';
      case '/admin/profile': return 'Admin Profile';
      default: return 'Super Admin Dashboard';
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onLogout={onLogout}
      />

      {/* Main Workspace Area */}
      <div className="admin-main">
        {/* Topbar Header */}
        <header className="admin-topbar">
          
          {/* Left: Mobile menu toggle + page path title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-body)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="sidebar-mobile-toggle-btn"
            >
              <Menu size={20} />
            </button>
            <style>{`
              .sidebar-mobile-toggle-btn {
                display: none !important;
              }
              @media (max-width: 768px) {
                .sidebar-mobile-toggle-btn {
                  display: flex !important;
                }
              }
            `}</style>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {getPageTitle(currentPath)}
            </h2>
          </div>

          {/* Right: Theme Toggle & Admin identity info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-body)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {isDarkMode ? <Sun size={20} style={{ color: '#FBBF24' }} /> : <Moon size={20} />}
            </button>

            {/* Admin Profile Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                {adminEmail ? adminEmail.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', lineHeight: 1.2 }} className="topbar-user-info">
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {adminEmail || 'Administrator'}
                </span>
                <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                  <ShieldCheck size={10} /> Online
                </span>
              </div>
              <style>{`
                @media (max-width: 480px) {
                  .topbar-user-info {
                    display: none !important;
                  }
                }
              `}</style>
            </div>

          </div>

        </header>

        {/* Dynamic page sub-views content rendering */}
        <main className="admin-content admin-scrollable">
          {children}
        </main>
      </div>
    </div>
  );
};
