import React from 'react';
import { FounderCard } from './FounderCard';
import { Container } from './Container';
import { Target, Heart } from 'lucide-react';

export const AboutUs: React.FC = () => {
  const founders = [
    {
      name: 'Sandeep Malhotra',
      role: 'Co-Founder & Business Lead',
      bio: 'Deep financial acumen with a robust background in commercial banking, corporate finance operations, and venture evaluation strategy.',
      skills: ['Business Operations', 'Financial Strategy', 'Capital Allocation'],
      avatarIcon: 'finance' as const,
    },
    {
      name: 'Siddhant Saxena',
      role: 'Co-Founder & Product Lead',
      bio: 'Expert digital product developer and freelance website designer specializing in UX architecture, conversion psychology, and interface design.',
      skills: ['UI/UX Specialist', 'Digital Product Builder', 'Frontend Engineer'],
      avatarIcon: 'design' as const,
    },
  ];

  return (
    <section
      id="about"
      style={{
        padding: '5rem 1.5rem 8rem 1.5rem',
        backgroundColor: 'var(--accent-light)',
        borderTop: '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      <Container>
        {/* Title Area */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '4rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#fff',
              border: '1.5px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '0.4rem 0.85rem',
              borderRadius: '99px',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <Target size={14} style={{ color: 'var(--primary)' }} />
            <span>WHO WE ARE</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Meet the Founders
          </h2>
          
          <p style={{ fontSize: '1.05rem', color: 'var(--text-body)', maxWidth: '600px', lineHeight: 1.6 }}>
            Combining industry financial expertise with agile digital product development to turn raw data into sustainable businesses.
          </p>
        </div>

        {/* Founders Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: '4rem',
          }}
          className="founders-grid"
        >
          {founders.map((founder) => (
            <FounderCard key={founder.name} founder={founder} />
          ))}
        </div>

        {/* Mission Statement Card */}
        <div
          className="glass-panel"
          style={{
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-md)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Heart size={20} fill="currentColor" />
          </div>
          
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.4,
              maxWidth: '680px',
            }}
          >
            "We believe businesses should be built using real customer demand instead of assumptions."
          </p>
          
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Our Driving Mission
          </span>
        </div>
      </Container>
      
      <style>{`
        @media (max-width: 480px) {
          .founders-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
export default AboutUs;
