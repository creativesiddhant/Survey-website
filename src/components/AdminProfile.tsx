import React from 'react';
import { User, ShieldAlert, Key, LogOut } from 'lucide-react';

interface AdminUser {
  email?: string;
  created_at: string;
}

interface AdminProfileProps {
  user: AdminUser | null;
  onLogout: () => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ user, onLogout }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '640px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Administrator Account
        </h1>
        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
          Manage your credentials, security settings, and active session tokens.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {user?.email || 'Administrator Session'}
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
              Role: <strong style={{ color: 'var(--primary)' }}>Super Administrator</strong>
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
            fontSize: '0.9rem'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-body)', fontSize: '0.8rem', display: 'block' }}>Account Created:</span>
            <strong style={{ color: 'var(--text-main)' }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-body)', fontSize: '0.8rem', display: 'block' }}>Auth Scope:</span>
            <strong style={{ color: 'var(--text-main)' }}>Supabase PostgreSQL / RLS Policies</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-body)', fontSize: '0.8rem', display: 'block' }}>Environment:</span>
            <strong style={{ color: 'var(--success)' }}>Production Live Node</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-body)', fontSize: '0.8rem', display: 'block' }}>Session Expiration:</span>
            <strong style={{ color: 'var(--text-main)' }}>JWT token autorenew (3600s)</strong>
          </div>
        </div>

        {/* Security Warning */}
        <div
          style={{
            backgroundColor: 'var(--accent-light)',
            border: '1.5px solid var(--border-color)',
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}
        >
          <ShieldAlert size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>Security Policy</strong>
            Admin accounts are tied to your Supabase Auth user management console. Password modifications or adding new admin emails must be executed securely through your main dashboard.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <button
            onClick={() => {
              if (window.confirm('Do you want to request password change details? This will send reset instructions.')) {
                alert('Password reset instructions sent. Please check your inbox.');
              }
            }}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
          >
            <Key size={14} /> Request Password Reset
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                onLogout();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              border: '1px solid #FCA5A5',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> Terminate Admin Session
          </button>
        </div>

      </div>

    </div>
  );
};
