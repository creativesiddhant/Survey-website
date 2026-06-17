import { Briefcase, Code } from 'lucide-react';


interface Founder {
  name: string;
  role: string;
  skills: string[];
  bio: string;
  avatarIcon: 'finance' | 'design';
}

interface FounderCardProps {
  founder: Founder;
}

export const FounderCard: React.FC<FounderCardProps> = ({ founder }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '2rem',
        border: '1.5px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        transition: 'var(--transition-smooth)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="founder-card"
    >
      {/* Decorative top-right accent */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          opacity: 0.5,
          zIndex: 1,
        }}
      />

      {/* Avatar Icon and Name Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', zIndex: 2 }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: founder.avatarIcon === 'finance' ? 'var(--primary-light)' : 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: founder.avatarIcon === 'finance' ? 'var(--primary)' : 'var(--accent)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {founder.avatarIcon === 'finance' ? <Briefcase size={28} /> : <Code size={28} />}
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{founder.name}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{founder.role}</p>
        </div>
      </div>

      {/* Bio Description */}
      <p style={{ fontSize: '0.95rem', color: 'var(--text-body)', lineHeight: 1.6, zIndex: 2 }}>
        {founder.bio}
      </p>

      {/* Specialties list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 2, marginTop: 'auto' }}>
        <h4
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem',
          }}
        >
          Areas of Expertise
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {founder.skills.map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid rgba(99, 102, 241, 0.1)',
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        .founder-card:hover {
          transform: translateY(-6px);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
};
export default FounderCard;
