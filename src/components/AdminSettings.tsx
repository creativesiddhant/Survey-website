import React, { useState, useEffect } from 'react';
import { Shield, Paintbrush, FileSpreadsheet } from 'lucide-react';
import { Button } from './Button';
import { fetchSystemSettings, saveSystemSettings } from '../services/supabaseService';

export const AdminSettings: React.FC = () => {
  // Theme state
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  
  // Survey limits state
  const [dupBlock, setDupBlock] = useState(true);
  const [submissionLimit, setSubmissionLimit] = useState(1);
  const [exportPref, setExportPref] = useState('csv');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = localStorage.getItem('theme_preference') as 'light' | 'dark' | 'system' || 'system';
      setThemeMode(savedTheme);

      const sysSettings = await fetchSystemSettings();
      setDupBlock(sysSettings.duplicateBlock);
      setSubmissionLimit(sysSettings.submissionLimit);
      setExportPref(sysSettings.exportPref);
    };
    loadSettings();
  }, []);

  const handleApplyTheme = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    localStorage.setItem('theme_preference', mode);
    
    // Apply changes to document body
    const body = document.body;
    if (mode === 'dark') {
      body.classList.add('dark');
    } else if (mode === 'light') {
      body.classList.remove('dark');
    } else {
      // System mode
      const matchesDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (matchesDark) {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await saveSystemSettings({
      duplicateBlock: dupBlock,
      submissionLimit,
      exportPref
    });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '640px' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          Dashboard Settings
        </h1>
        <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
          Configure user visual modes, system exports, and duplicate checking thresholds.
        </p>
      </div>

      {/* Settings Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Theme Settings Card */}
        <div className="glass-panel" style={{ padding: '1.50rem 1.75rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Paintbrush size={18} style={{ color: 'var(--primary)' }} />
            Appearance Preference
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
            Switch between light mode, dark mode, or follow your operating system default colors.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            {['light', 'dark', 'system'].map((mode) => {
              const active = themeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => handleApplyTheme(mode as any)}
                  className="glass-panel"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: active ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: active ? 'var(--primary-light)' : 'var(--bg-card)',
                    color: active ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Survey Controls Card */}
        <div className="glass-panel" style={{ padding: '1.50rem 1.75rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--success)' }} />
            Survey Fraud controls
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
            Adjust how the survey restricts double submissions to preserve accurate market research metrics.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
            
            {/* Duplicate Block Toggle */}
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              <span>Prevent Double Submissions (Fingerprint + UUID check)</span>
              <input
                type="checkbox"
                checked={dupBlock}
                onChange={(e) => setDupBlock(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </label>

            {/* Submission Limit selection */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              <span>Submission Limit (per participant)</span>
              <select
                value={submissionLimit}
                onChange={(e) => setSubmissionLimit(Number(e.target.value))}
                style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
              >
                <option value={1}>1 Response max</option>
                <option value={2}>2 Responses max</option>
                <option value={999}>Unlimited responses</option>
              </select>
            </div>

          </div>
        </div>

        {/* Data Export Preferences */}
        <div className="glass-panel" style={{ padding: '1.50rem 1.75rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} />
            Preferred Export Formats
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-main)' }}>
            <span>Default report export format</span>
            <select
              value={exportPref}
              onChange={(e) => setExportPref(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="csv">Standard CSV File</option>
              <option value="json">Raw JSON Payload</option>
              <option value="xls">Microsoft Excel (.xls)</option>
            </select>
          </div>
        </div>

        {/* Save feedback messages */}
        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
          {isSaved && (
            <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: 600 }}>
              ✓ Settings saved successfully.
            </span>
          )}
          <Button
            variant="primary"
            disabled={isSaving}
            onClick={handleSaveSettings}
            style={{ padding: '0.65rem 1.5rem', borderRadius: '12px', marginLeft: 'auto' }}
          >
            {isSaving ? 'Saving Settings...' : 'Save Panel Settings'}
          </Button>
        </div>

      </div>

    </div>
  );
};
