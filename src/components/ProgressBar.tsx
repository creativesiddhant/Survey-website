import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div style={{ width: '100%', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '0.6rem',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          Question {current} of {total}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          {percentage}% Complete
        </span>
      </div>
      
      {/* Background container for the bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--primary-light)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >
        {/* Animated fill */}
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--primary)',
            borderRadius: '99px',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};
