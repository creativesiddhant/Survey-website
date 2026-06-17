import React from 'react';
import { Check } from 'lucide-react';

export interface BusinessOption {
  id: string;
  emoji: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

interface BusinessCardProps {
  option: BusinessOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ option, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: isSelected ? '2.5px solid var(--primary)' : '1.5px solid var(--border-color)',
        boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '260px',
      }}
      className="business-card"
    >
      {/* Selection Glow / Highlight Background */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--primary)',
          }}
        />
      )}

      {/* Card Header: Emoji, Title, Selection Checkmark */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{option.emoji}</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{option.title}</h3>
        </div>

        {/* Selected Checkmark Badge */}
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
            border: isSelected ? 'none' : '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'var(--transition-fast)',
          }}
        >
          {isSelected && <Check size={14} strokeWidth={3} className="animate-scale-in" />}
        </div>
      </div>

      {/* Illustration Area */}
      <div
        style={{
          height: '110px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-main)',
          borderRadius: '12px',
          transition: 'var(--transition-smooth)',
          padding: '0.5rem',
        }}
      >
        {option.illustration}
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5, marginTop: 'auto' }}>
        {option.description}
      </p>

      {/* CSS Effects */}
      <style>{`
        .business-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
        .business-card:active {
          transform: translateY(-2px) scale(0.99);
        }
      `}</style>
    </div>
  );
};

// SVG Illustration helper components
export const FoxnutsIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Bowl */}
    <path d="M20 40C20 56.5 33.5 70 50 70H70C86.5 70 100 56.5 100 40H20Z" fill="var(--accent)" opacity="0.8" />
    <path d="M15 40H105" stroke="var(--text-main)" strokeWidth="3.5" strokeLinecap="round" />
    
    {/* Foxnuts */}
    <circle cx="36" cy="34" r="9" fill="#FFFBF2" stroke="var(--text-main)" strokeWidth="2" />
    <circle cx="28" cy="36" r="2" fill="#E2D9C5" />
    
    <circle cx="50" cy="28" r="11" fill="#FFFBF2" stroke="var(--text-main)" strokeWidth="2" />
    <circle cx="46" cy="24" r="3" fill="#E2D9C5" />
    <circle cx="54" cy="30" r="2" fill="#E2D9C5" />

    <circle cx="68" cy="32" r="10" fill="#FFFBF2" stroke="var(--text-main)" strokeWidth="2" />
    <circle cx="66" cy="30" r="2" fill="#E2D9C5" />
    
    <circle cx="84" cy="35" r="9.5" fill="#FFFBF2" stroke="var(--text-main)" strokeWidth="2" />
    <circle cx="86" cy="33" r="2.5" fill="#E2D9C5" />

    <circle cx="58" cy="38" r="8" fill="#FFFBF2" stroke="var(--text-main)" strokeWidth="2" />
  </svg>
);

export const CoffeeIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Animated Steam */}
    <path d="M48 20 C48 15, 52 15, 52 10" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="steam-line" />
    <path d="M60 20 C60 14, 64 14, 64 8" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="steam-line-delayed" />
    <path d="M72 20 C72 16, 76 16, 76 11" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" className="steam-line" />

    {/* Cup Body */}
    <path d="M36 30H84C84 52 78 64 60 64C42 64 36 52 36 30Z" fill="var(--primary)" />
    <path d="M84 38H96C102 38 102 48 96 48H84" stroke="var(--primary)" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M30 68H90" stroke="var(--text-main)" strokeWidth="3" strokeLinecap="round" />

    <style>{`
      @keyframes steam {
        0%, 100% { transform: translateY(0) opacity(0.3); }
        50% { transform: translateY(-3px) opacity(1); }
      }
      .steam-line {
        animation: steam 2s ease-in-out infinite;
      }
      .steam-line-delayed {
        animation: steam 2s ease-in-out infinite;
        animation-delay: 0.8s;
      }
    `}</style>
  </svg>
);

export const SpicesIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Left Spice Jar */}
    <rect x="25" y="30" width="28" height="36" rx="4" fill="#F59E0B" opacity="0.8" stroke="var(--text-main)" strokeWidth="2" />
    <rect x="29" y="24" width="20" height="6" rx="2" fill="var(--text-main)" />
    <line x1="32" y1="46" x2="46" y2="46" stroke="#fff" strokeWidth="2" />
    
    {/* Right Spice Jar */}
    <rect x="65" y="26" width="30" height="40" rx="4" fill="#DC2626" opacity="0.8" stroke="var(--text-main)" strokeWidth="2" />
    <rect x="70" y="20" width="20" height="6" rx="2" fill="var(--text-main)" />
    <circle cx="80" cy="46" r="5" fill="#FDE047" />
  </svg>
);

export const WaterIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Water bottle */}
    <rect x="46" y="22" width="28" height="46" rx="6" fill="#38BDF8" opacity="0.3" stroke="var(--text-main)" strokeWidth="2" />
    <rect x="52" y="14" width="16" height="8" rx="2" fill="var(--primary)" />
    {/* Ridges */}
    <line x1="50" y1="34" x2="70" y2="34" stroke="var(--text-main)" strokeWidth="1.5" />
    <line x1="50" y1="44" x2="70" y2="44" stroke="var(--text-main)" strokeWidth="1.5" />
    <line x1="50" y1="54" x2="70" y2="54" stroke="var(--text-main)" strokeWidth="1.5" />
    
    {/* Water drop details */}
    <path d="M60 38C58 40 58 43 60 45C62 47 65 45 65 43C65 41 62 39 60 38Z" fill="#0284C7" />
  </svg>
);

export const StationeryIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Notebook */}
    <rect x="26" y="22" width="44" height="46" rx="4" fill="#EEF2FF" stroke="var(--text-main)" strokeWidth="2" />
    {/* Ring binder spirals */}
    <circle cx="26" cy="28" r="3" fill="var(--text-main)" />
    <circle cx="26" cy="38" r="3" fill="var(--text-main)" />
    <circle cx="26" cy="48" r="3" fill="var(--text-main)" />
    <circle cx="26" cy="58" r="3" fill="var(--text-main)" />
    <line x1="36" y1="32" x2="60" y2="32" stroke="var(--border-color)" strokeWidth="2" />
    <line x1="36" y1="44" x2="60" y2="44" stroke="var(--border-color)" strokeWidth="2" />
    <line x1="36" y1="56" x2="60" y2="56" stroke="var(--border-color)" strokeWidth="2" />

    {/* Pencil crossing notebook */}
    <g style={{ transform: 'rotate(-25deg) translate(20px, 30px)' }}>
      <rect x="40" y="5" width="8" height="48" fill="#FBBF24" stroke="var(--text-main)" strokeWidth="1.5" />
      <path d="M40 5L44 0L48 5H40Z" fill="#F87171" />
      <path d="M40 53H48V56H40V53Z" fill="#1E1B4B" />
    </g>
  </svg>
);

export const BiodegradableIllustration: React.FC = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxHeight: '90px' }}>
    {/* Leaf Plate */}
    <circle cx="60" cy="45" r="28" fill="#D1FAE5" stroke="var(--text-main)" strokeWidth="2" />
    <circle cx="60" cy="45" r="23" fill="none" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="4 4" />
    
    {/* Leaf graphic inside */}
    <path d="M60 27C67 34 67 46 60 53C53 46 53 34 60 27Z" fill="var(--success)" stroke="var(--text-main)" strokeWidth="1.5" />
    <line x1="60" y1="27" x2="60" y2="53" stroke="#fff" strokeWidth="1.5" />
  </svg>
);
