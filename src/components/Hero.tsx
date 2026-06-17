import React from 'react';
import { Button } from './Button';
import { Play, Shield, Clock } from 'lucide-react';

interface HeroProps {
  onStartSurvey: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartSurvey }) => {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '3rem',
          maxWidth: '1200px',
          width: '100%',
          alignItems: 'center',
          zIndex: 10,
        }}
        className="hero-grid"
      >
        {/* Left column: Text Content */}
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.5rem 1rem',
              borderRadius: '99px',
              width: 'fit-content',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ⚡ ACTIVE MARKET STUDY
          </div>
          
          <h1
            style={{
              fontSize: '3.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.15,
            }}
          >
            Help Us Build India's Next Successful Business
          </h1>
          
          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-body)',
              lineHeight: 1.7,
              maxWidth: '540px',
            }}
          >
            Participate in our short, premium market research survey. We are leveraging real citizen demand to launch products people genuinely want and need, avoiding assumptions.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                icon={<Play size={16} fill="currentColor" />}
                onClick={onStartSurvey}
              >
                Start Survey
              </Button>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text-body)',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
              >
                <Clock size={16} style={{ color: 'var(--primary)' }} />
                <span>Takes 2–3 Mins</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
              }}
            >
              <Shield size={14} />
              <span>We never collect sensitive personal information. Data is encrypted.</span>
            </div>
          </div>
        </div>

        {/* Right column: Graphic Mockup Illustration */}
        <div
          className="animate-slide-up"
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animationDelay: '0.2s',
          }}
        >
          {/* Main Card graphic representing the Survey */}
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
            }}
          >
            {/* Header of mockup */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.25rem 0.6rem', borderRadius: '8px' }}>
                Active Survey
              </span>
            </div>

            {/* Mock question card */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>Question 6 of 8</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Which business excites you the most?
              </div>

              {/* Sample Business choice cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '2px solid var(--primary)',
                    backgroundColor: 'var(--primary-light)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🥣</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Foxnuts</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>Healthy premium snack.</div>
                  </div>
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                    }}
                  >
                    ✓
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#fff',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>☕</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Coffee</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>Daily beverage loved worldwide.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar mock */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                <span>Survey Progress</span>
                <span>75%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
          
          {/* Floating abstract decorative badge */}
          <div
            className="animate-float-1"
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-20px',
              backgroundColor: '#fff',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              borderRadius: '16px',
              padding: '0.75rem 1.25rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>100% Privacy</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-body)' }}>Anonymous submissions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic responsive styling override */}
      <style>{`
        @media (max-width: 968px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
            gap: 4rem !important;
          }
          .hero-grid > div {
            align-items: center !important;
            justify-content: center !important;
          }
          .hero-grid h1 {
            font-size: 2.5rem !important;
          }
          .hero-grid p {
            max-width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};
