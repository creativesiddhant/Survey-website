import React from 'react';

export const FloatingElements: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* 🥣 Foxnuts (Floating illustration) */}
      <div
        className="animate-float-1"
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          width: '54px',
          height: '54px',
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="28" fill="var(--primary-light)" />
          <path d="M22 28C22 24 26 22 32 22C38 22 42 24 42 28C42 34 38 38 32 38C26 38 22 34 22 28Z" fill="#E2E8F0" />
          <circle cx="28" cy="26" r="3" fill="#fff" />
          <circle cx="34" cy="30" r="4" fill="#fff" />
          <circle cx="38" cy="26" r="2.5" fill="#fff" />
          <circle cx="30" cy="32" r="2" fill="#fff" />
        </svg>
      </div>

      {/* ☕ Coffee Cup with Steam */}
      <div
        className="animate-float-2"
        style={{
          position: 'absolute',
          top: '25%',
          right: '10%',
          width: '60px',
          height: '60px',
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cup body */}
          <path d="M18 24H42C42 34 38 38 30 38H30C22 38 18 34 18 24Z" fill="var(--primary)" />
          {/* Handle */}
          <path d="M42 27H46C49 27 49 32 46 32H42" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
          {/* Steam lines */}
          <path d="M24 18C24 16 26 15 26 13" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 18C30 15 32 14 32 11" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M36 18C36 16 38 15 38 13" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 💧 Packaged Water / Water Drop */}
      <div
        className="animate-float-3"
        style={{
          position: 'absolute',
          top: '60%',
          left: '6%',
          width: '45px',
          height: '45px',
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M32 12C32 12 16 30 16 40C16 48.8 23.2 56 32 56C40.8 56 48 48.8 48 40C48 30 32 12 32 12Z" fill="var(--accent)" />
          <path d="M26 38C26 34.7 28.7 32 32 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 🌿 Leaf */}
      <div
        className="animate-float-1"
        style={{
          position: 'absolute',
          top: '75%',
          right: '8%',
          width: '50px',
          height: '50px',
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 48C28 48 48 40 48 16C48 16 24 16 16 32C12 40 16 48 16 48Z" fill="var(--success)" />
          <path d="M16 48C24 40 38 30 48 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* ✏️ Stationery / Pencil */}
      <div
        className="animate-float-2"
        style={{
          position: 'absolute',
          top: '45%',
          right: '5%',
          width: '48px',
          height: '48px',
          opacity: 0.12,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(45deg)' }}>
          <rect x="24" y="8" width="16" height="40" rx="2" fill="var(--primary)" />
          <path d="M24 12H40V16H24V12Z" fill="var(--accent)" />
          <path d="M24 48L32 56L40 48H24Z" fill="#FDE047" />
          <path d="M30 54L32 56L34 54V52H30V54Z" fill="#1E1B4B" />
        </svg>
      </div>

      {/* 📈 Bar Graph / Stats */}
      <div
        className="animate-float-3"
        style={{
          position: 'absolute',
          top: '80%',
          left: '12%',
          width: '56px',
          height: '56px',
          opacity: 0.15,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="38" width="10" height="18" rx="2" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2" />
          <rect x="27" y="24" width="10" height="32" rx="2" fill="var(--primary-light)" stroke="var(--primary)" strokeWidth="2" />
          <rect x="42" y="12" width="10" height="44" rx="2" fill="var(--accent)" />
        </svg>
      </div>

      {/* 💬 Emoji Bubble */}
      <div
        className="animate-float-1"
        style={{
          position: 'absolute',
          top: '38%',
          left: '10%',
          width: '50px',
          height: '50px',
          opacity: 0.18,
        }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="64" height="48" rx="16" fill="var(--primary-light)" />
          <path d="M16 48L16 56L26 48" fill="var(--primary-light)" />
          <text x="32" y="30" dominantBaseline="middle" textAnchor="middle" fontSize="22">💡</text>
        </svg>
      </div>
    </div>
  );
};
