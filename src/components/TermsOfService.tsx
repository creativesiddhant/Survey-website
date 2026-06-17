import React, { useEffect } from 'react';
import { ArrowLeft, Scale, CheckCircle, AlertTriangle } from 'lucide-react';
import { Container } from './Container';

interface TermsOfServiceProps {
  onBackToHome: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBackToHome }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section style={{ padding: '3rem 1.5rem 6rem 1.5rem', backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
      <Container>
        {/* Back Button */}
        <button
          onClick={onBackToHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem',
            marginBottom: '2rem',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            backgroundColor: 'var(--primary-light)',
            transition: 'var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(-4px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Article Layout */}
        <div
          className="glass-panel"
          style={{
            borderRadius: '24px',
            padding: '3rem 2.5rem',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)',
            color: 'var(--text-body)',
            lineHeight: 1.8,
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.4rem 0.85rem',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              <Scale size={14} />
              <span>TERMS OF SERVICE</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Terms of Service
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              Last Updated: June 17, 2026
            </p>
          </div>

          {/* Key terms boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <CheckCircle style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Eligibility</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Surveys are open to general public in India aged 18 and above.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <Scale style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Fair Response</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Responses must represent genuine human feedback. Automated scripts are strictly barred.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <AlertTriangle style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Disclaimer</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>Survey insights are for research only and do not guarantee final launch designs.</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="terms-content">
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing or using the Survey Website, participating in our surveys, or entering reward draws, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should not complete or submit any survey entries.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                2. Eligibility and Participation Rules
              </h3>
              <p>
                To complete surveys or participate in reward selections, you must:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <li>Be at least 18 years of age or have parental consent.</li>
                <li>Submit authentic choices that represent your actual views and opinions.</li>
                <li>Submit only one response per survey. Duplicate or bot-generated submissions will be filtered and discarded.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                3. Rewards and Lucky Draw Terms
              </h3>
              <p>
                From time to time, we may offer incentives or entries to a lucky draw for completing a survey:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <li>Providing contact information is voluntary but required for reward claim coordination.</li>
                <li>Winners will be picked at random and notified via their shared email or phone number.</li>
                <li>If a winner does not respond within 14 business days, another winner may be selected.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                4. Intellectual Property Rights
              </h3>
              <p>
                All data, aggregations, charts, reports, text, and graphics shown on the Survey Website are the sole intellectual property of Survey Website. The feedback you submit becomes our research property for statistical aggregation, and you waive any claims to royalties or ownership over businesses created from these aggregated insights.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                5. Limitation of Liability
              </h3>
              <p>
                We provide the survey platform and information "as is." We make no representations or warranties that the portal will be uninterrupted, error-free, or secure. Under no circumstances will Survey Website or its co-founders be liable for any direct, indirect, or incidental damages.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                6. Governing Law
              </h3>
              <p>
                These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of these terms or survey participation will be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
export default TermsOfService;
