import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Container } from './Container';

interface PrivacyPolicyProps {
  onBackToHome: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBackToHome }) => {
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
              <Shield size={14} />
              <span>PRIVACY POLICY</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              Last Updated: June 17, 2026
            </p>
          </div>

          {/* Quick Pillars */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <Lock style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Data Encryption</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>All submitted responses are strictly encrypted in transit and at rest.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <Eye style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Anonymous Input</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>We never ask for sensitive personal items like passwords, Aadhaar, or financial details.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: 'rgba(99, 102, 241, 0.03)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
              <FileText style={{ color: 'var(--primary)', flexShrink: 0 }} size={24} />
              <div>
                <h4 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>No Spam Policy</h4>
                <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.4 }}>We only use contact info to notify chosen survey participants regarding rewards.</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="policy-content">
            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                1. Information We Collect
              </h3>
              <p>
                We collect information you provide directly to us when participating in our market research surveys. This includes:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <li>Survey responses (preferences, ratings, rankings, choices, and state of residence).</li>
                <li>Contact information (email address or phone number) if you choose to enter lucky draws or rewards programs.</li>
                <li>Device metadata (browser version, OS, timestamp) automatically collected to detect spam and duplicate entries.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                2. How We Use Your Information
              </h3>
              <p>
                The information we collect is strictly used to validate market demand and outline viable business models. Specifically:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <li>To aggregate statistics about consumer choice (e.g. food versus beverage preferences).</li>
                <li>To select winners for reward programs and contact them with instructions.</li>
                <li>To improve the performance, design, and user experience of our survey portal.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                3. Sharing and Disclosure
              </h3>
              <p>
                We do not sell, rent, or trade your personal data to third parties. We may share aggregated, non-personally identifiable research data with stakeholders, partners, and our community to report overall survey results and market demand findings.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                4. Data Retention and Security
              </h3>
              <p>
                We employ standard industry security protocols to safeguard your responses. We retain data only as long as necessary to fulfill the research scope described. Contact details for lottery draws are permanently purged within 90 days after survey completion and prize distribution.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                5. Your Rights and Choices
              </h3>
              <p>
                Participation is completely voluntary. You can exit the survey at any point. If you have provided an email address or contact number and wish to have it deleted before the survey wraps up, you can contact our privacy officer.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-main)', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                6. Contact Us
              </h3>
              <p>
                If you have any questions or feedback regarding this Privacy Policy, please feel free to reach out to us at:
                <br />
                <strong>Email:</strong> privacy@surveywebsite.com
                <br />
                <strong>Address:</strong> Survey Website Team, Bangalore, India.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
export default PrivacyPolicy;
