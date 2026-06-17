import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SurveyCard } from './components/SurveyCard';
import { AboutUs } from './components/AboutUs';
import { FloatingElements } from './components/FloatingElements';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';

function App() {
  const [view, setView] = useState<'home' | 'privacy' | 'terms'>('home');

  const handleStartSurvey = () => {
    const surveySection = document.getElementById('survey');
    if (surveySection) {
      surveySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Programmatically focus inside survey card if necessary
      setTimeout(() => {
        const root = document.getElementById('survey-card-root');
        if (root) {
          root.focus();
        }
      }, 800);
    }
  };

  const handleNavigate = (newView: 'home' | 'privacy' | 'terms', sectionId?: string) => {
    setView(newView);
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Background design elements */}
      <FloatingElements />

      {/* Floating navigation header */}
      <Navbar onNavigate={handleNavigate} />

      {/* Main content layouts */}
      <main style={{ flex: 1, zIndex: 10 }}>
        {view === 'home' && (
          <>
            {/* Section 1: Hero */}
            <Hero onStartSurvey={handleStartSurvey} />

            {/* Section 2: Interactive Survey */}
            <SurveyCard />

            {/* Section 3: About Us */}
            <AboutUs />
          </>
        )}
        {view === 'privacy' && <PrivacyPolicy onBackToHome={() => handleNavigate('home', 'hero')} />}
        {view === 'terms' && <TermsOfService onBackToHome={() => handleNavigate('home', 'hero')} />}
      </main>

      {/* Modern footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <span>© 2026 Survey Website Inc. All rights reserved.</span>
          <div className="footer-links">
            <button
              onClick={() => handleNavigate('privacy')}
              className="footer-link-btn"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavigate('terms')}
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
