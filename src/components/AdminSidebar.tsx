import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout
}) => {
  const menuItems: SidebarItem[] = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/responses', 
      label: 'Responses', 
      icon: <MessageSquare size={20} /> 
    },
    { 
      path: '/admin/analytics', 
      label: 'Analytics', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      path: '/admin/business', 
      label: 'Business Insights', 
      icon: <TrendingUp size={20} /> 
    },
    { 
      path: '/admin/settings', 
      label: 'Settings', 
      icon: <Settings size={20} /> 
    },
    { 
      path: '/admin/profile', 
      label: 'Profile', 
      icon: <User size={20} /> 
    }
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 99,
          }}
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          boxShadow: 'var(--shadow-md)',
          zIndex: 100
        }}
      >
        {/* Header logo area */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <ShieldCheck size={18} />
            </div>
            <span className="sidebar-logo-text" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
              Super Admin
            </span>
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            style={{ display: 'none' }} /* We toggle display on desktop/tablet media queries or show a nice icon */
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Menu navigation */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setMobileOpen(false);
                }}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span className="sidebar-item-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / Logout */}
        <div className="sidebar-footer">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out of the Admin panel?')) {
                onLogout();
              }
            }}
            className="sidebar-item"
            style={{ color: '#EF4444' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#EF4444';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={20} />
            </span>
            <span className="sidebar-item-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
