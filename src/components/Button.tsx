import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  style,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  let btnBg = 'var(--primary)';
  let btnColor = '#FFFFFF';
  let btnBorder = 'none';

  if (isSecondary) {
    btnBg = 'var(--primary-light)';
    btnColor = 'var(--primary)';
  } else if (variant === 'outline') {
    btnBg = 'transparent';
    btnColor = 'var(--text-main)';
    btnBorder = '2px solid var(--border-color)';
  }

  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        backgroundColor: btnBg,
        color: btnColor,
        border: btnBorder,
        padding: '0.85rem 1.75rem',
        borderRadius: '16px',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '1rem',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        transition: 'var(--transition-fast)',
        opacity: props.disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        minHeight: '48px', // Mobile touch target size check
        boxShadow: isPrimary ? '0 4px 14px 0 rgba(99, 102, 241, 0.3)' : 'none',
        userSelect: 'none',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (props.disabled) return;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
          e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(99, 102, 241, 0.4)';
        } else if (isSecondary) {
          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.15)';
        } else {
          e.currentTarget.style.borderColor = 'var(--primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (props.disabled) return;
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        if (isPrimary) {
          e.currentTarget.style.backgroundColor = 'var(--primary)';
          e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(99, 102, 241, 0.3)';
        } else if (isSecondary) {
          e.currentTarget.style.backgroundColor = 'var(--primary-light)';
        } else {
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }
      }}
      onMouseDown={(e) => {
        if (props.disabled) return;
        e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
      }}
      onMouseUp={(e) => {
        if (props.disabled) return;
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
      }}
    >
      {icon && iconPosition === 'left' && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span style={{ display: 'flex' }}>{icon}</span>}
    </button>
  );
};
