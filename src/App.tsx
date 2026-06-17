import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SurveyCard } from './components/SurveyCard';
import { AboutUs } from './components/AboutUs';
import { FloatingElements } from './components/FloatingElements';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

// Admin Imports
import { AdminLogin } from './components/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { AdminHome } from './components/AdminHome';
import { AdminResponses } from './components/AdminResponses';
import { AdminAnalytics } from './components/AdminAnalytics';
import { AdminBusiness } from './components/AdminBusiness';
import { AdminSettings } from './components/AdminSettings';
import { AdminProfile } from './components/AdminProfile';

import { 
  getCurrentUser, 
  signOutAdmin, 
  fetchAllResponses, 
  fetchAllVisitorSessions 
} from './services/supabaseService';

function App() {
  // Routing: Track the current pathname
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  
  // Public tab views (for legacy fallback routing support)
  const [publicView, setPublicView] = useState<'home' | 'privacy' | 'terms'>('home');

  // Admin Auth States
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAdminAuthLoading, setIsAdminAuthLoading] = useState<boolean>(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Admin Data States
  const [adminResponses, setAdminResponses] = useState<any[]>([]);
  const [adminSessions, setAdminSessions] = useState<any[]>([]);
  const [isAdminDataLoading, setIsAdminDataLoading] = useState<boolean>(false);

  // Handle SPA routing
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Check Auth & Theme on Mount and Path changes
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Theme initialization depending on path
      const body = document.body;
      if (currentPath.startsWith('/admin')) {
        const savedTheme = localStorage.getItem('theme_preference') || 'system';
        if (savedTheme === 'dark') {
          body.classList.add('dark');
        } else if (savedTheme === 'light') {
          body.classList.remove('dark');
        } else {
          // System Theme Default
          const matchesDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (matchesDark) {
            body.classList.add('dark');
          } else {
            body.classList.remove('dark');
          }
        }
      } else {
        // Public landing pages must strictly remain in light theme
        body.classList.remove('dark');
      }

      // 2. Auth Session Check
      try {
        const user = await getCurrentUser();
        if (user) {
          setAdminUser(user);
          setIsAdminAuthenticated(true);
        } else {
          // If we had checked "Remember Me", session might still be invalid/expired, so clear
          setIsAdminAuthenticated(false);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      } finally {
        setIsAdminAuthLoading(false);
      }
    };

    initializeApp();
  }, [currentPath]);

  // Fetch admin database metrics
  const loadAdminData = async () => {
    if (!isAdminAuthenticated) return;
    setIsAdminDataLoading(true);
    try {
      const [resps, sess] = await Promise.all([
        fetchAllResponses(),
        fetchAllVisitorSessions()
      ]);
      setAdminResponses(resps);
      setAdminSessions(sess);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setIsAdminDataLoading(false);
    }
  };

  // Load metrics when admin auth becomes true
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAdminData();
    }
  }, [isAdminAuthenticated]);

  const handleStartSurvey = () => {
    const surveySection = document.getElementById('survey');
    if (surveySection) {
      surveySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const root = document.getElementById('survey-card-root');
        if (root) {
          root.focus();
        }
      }, 800);
    }
  };

  const handlePublicNavigate = (newView: 'home' | 'privacy' | 'terms', sectionId?: string) => {
    setPublicView(newView);
    navigate('/');
    if (newView === 'home') {
      if (sectionId) {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutAdmin();
      setAdminUser(null);
      setIsAdminAuthenticated(false);
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // RENDER DYNAMIC ADMIN VIEWS
  const renderAdminSubRoute = () => {
    switch (currentPath) {
      case '/admin':
        return (
          <AdminHome
            responses={adminResponses}
            sessions={adminSessions}
            onRefresh={loadAdminData}
            isLoading={isAdminDataLoading}
          />
        );
      case '/admin/responses':
        return (
          <AdminResponses
            responses={adminResponses}
            onRefresh={loadAdminData}
          />
        );
      case '/admin/analytics':
        return <AdminAnalytics responses={adminResponses} />;
      case '/admin/business':
        return <AdminBusiness responses={adminResponses} />;
      case '/admin/settings':
        return <AdminSettings />;
      case '/admin/profile':
        return (
          <AdminProfile
            user={adminUser}
            onLogout={handleLogout}
          />
        );
      default:
        // Fallback redirection to dashboard home
        return (
          <AdminHome
            responses={adminResponses}
            sessions={adminSessions}
            onRefresh={loadAdminData}
            isLoading={isAdminDataLoading}
          />
        );
    }
  };

  // 1. RENDER AUTHENTICATION PROTECTION
  if (currentPath.startsWith('/admin')) {
    if (isAdminAuthLoading) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <span style={{ marginTop: '1rem', color: 'var(--text-body)', fontSize: '0.9rem', fontWeight: 600 }}>
            Verifying Admin Session...
          </span>
        </div>
      );
    }

    if (!isAdminAuthenticated) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <FloatingElements />
          <AdminLogin
            onLoginSuccess={async () => {
              const user = await getCurrentUser();
              setAdminUser(user);
              setIsAdminAuthenticated(true);
              navigate('/admin');
            }}
            onBackToHome={() => navigate('/')}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
        adminEmail={adminUser?.email}
      >
        {renderAdminSubRoute()}
      </AdminLayout>
    );
  }

  // 2. RENDER PUBLIC PAGES (Landing + Survey)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background design elements */}
      <FloatingElements />

      {/* Floating navigation header */}
      <Navbar onNavigate={handlePublicNavigate} />

      {/* Main content layouts */}
      <main style={{ flex: 1, zIndex: 10 }}>
        {publicView === 'home' && (
          <>
            {/* Section 1: Hero */}
            <Hero onStartSurvey={handleStartSurvey} />

            {/* Section 2: Interactive Survey */}
            <SurveyCard />

            {/* Section 3: About Us */}
            <AboutUs />
          </>
        )}
        {publicView === 'privacy' && <PrivacyPolicy onBackToHome={() => handlePublicNavigate('home', 'hero')} />}
        {publicView === 'terms' && <TermsOfService onBackToHome={() => handlePublicNavigate('home', 'hero')} />}
      </main>

      {/* Modern footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <span>© 2026 Survey Website Inc. All rights reserved.</span>
          <div className="footer-links">
            <button
              onClick={() => handlePublicNavigate('privacy')}
              className="footer-link-btn"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handlePublicNavigate('terms')}
              className="footer-link-btn"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
