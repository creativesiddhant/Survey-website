import React, { useState } from 'react';
import { signInAdmin, resetAdminPassword } from '../services/supabaseService';
import { Button } from './Button';
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await signInAdmin(email, password);
      if (rememberMe) {
        localStorage.setItem('admin_remember', 'true');
      } else {
        localStorage.removeItem('admin_remember');
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Invalid administrator email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please provide your admin email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await resetAdminPassword(email);
      setSuccessMessage('Password reset instructions sent to your email.');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to trigger password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '24px',
          padding: '3rem 2.5rem',
          boxShadow: 'var(--shadow-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
          >
            🛡️
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isForgotMode ? 'Reset Password' : 'Super Admin Login'}
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            {isForgotMode
              ? 'Enter your registered email to recover access.'
              : 'Sign in to access analytics and customer metrics.'}
          </p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              border: '1px solid #FCA5A5',
              fontWeight: 500
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              border: '1px solid #A7F3D0',
              fontWeight: 500
            }}
          >
            ✨ {successMessage}
          </div>
        )}

        {/* Forms */}
        {!isForgotMode ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-body)',
                    opacity: 0.6
                  }}
                />
                <input
                  type="email"
                  placeholder="admin@survey.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-color)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                >
                  Forgot?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-body)',
                    opacity: 0.6
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 2.75rem 0.85rem 2.75rem',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-color)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-body)',
                    opacity: 0.6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-body)',
                cursor: 'pointer',
                userSelect: 'none',
                marginTop: '0.25rem'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer'
                }}
              />
              Remember me on this machine
            </label>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Signing In...' : 'Verify Identity'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Registered Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-body)',
                    opacity: 0.6
                  }}
                />
                <input
                  type="email"
                  placeholder="admin@survey.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.75rem',
                    borderRadius: '14px',
                    border: '1.5px solid var(--border-color)',
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.9rem', borderRadius: '14px' }}
            >
              {isLoading ? 'Sending Request...' : 'Send Reset Link'}
            </Button>

            {/* Back to Login */}
            <button
              type="button"
              onClick={() => {
                setIsForgotMode(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-body)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
            marginTop: '0.5rem'
          }}
        >
          <button
            type="button"
            onClick={onBackToHome}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-body)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-body)')}
          >
            ← Back to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
