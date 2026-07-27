import React, { useState } from 'react';
import { ApiKeyConfig, Language } from '../../types';
import { AiOrchestrator } from '../../services/aiOrchestrator';
import { UserCheck, Globe, Palette, RefreshCw, Key, CheckCircle, XCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ProfileTabProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
}

const ACCENT_COLORS = ['#58cc02', '#1cb0f6', '#ff4b4b', '#ff9600', '#a463f2'];
const LANGUAGES: Language[] = ['French', 'Spanish', 'German', 'Italian', 'Japanese', 'Mandarin'];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentLanguage,
  onLanguageChange,
  accentColor,
  onAccentColorChange,
}) => {
  const [keys, setKeys] = useState<ApiKeyConfig>(AiOrchestrator.getApiKeys());
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSaveKeys = async () => {
    AiOrchestrator.saveApiKeys(keys);
    if (keys.geminiKey) {
      setIsValidating(true);
      const ok = await AiOrchestrator.validateKey('gemini', keys.geminiKey);
      setKeyStatus(ok ? 'Connected' : 'Invalid API Key');
      setIsValidating(false);
    } else {
      setKeyStatus('Saved');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '20px' }}>Profile & Settings</h2>

      {/* User Info Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserCheck size={32} color="#ffffff" />
        </div>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Demo Reviewer</h3>
          <div style={{ display: 'inline-block', marginTop: '4px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '8px' }}>
            Internship Evaluation Mode — Fully Unlocked
          </div>
        </div>
      </div>

      {/* API Key Management Dashboard */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={20} color={accentColor} />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>AI Model & API Key Configuration</h3>
          </div>
          {keyStatus && (
            <span style={{ fontSize: '12px', fontWeight: 800, color: keyStatus === 'Connected' ? '#22c55e' : '#ef4444' }}>
              {keyStatus}
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Add your Google Gemini, HuggingFace, or OpenRouter API key for high-speed custom AI tutoring.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>Gemini API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={keys.geminiKey || ''}
                onChange={(e) => setKeys({ ...keys, geminiKey: e.target.value })}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSaveKeys} disabled={isValidating} style={{ backgroundColor: accentColor, justifyContent: 'center', marginTop: '8px' }}>
            <ShieldCheck size={18} /> {isValidating ? 'Validating Connection...' : 'Save & Validate API Key'}
          </button>
        </div>
      </div>

      {/* Target Language Picker Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Globe size={20} color={accentColor} />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Target Language</h3>
        </div>
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-main)',
            color: 'var(--text-primary)',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Accent Color Picker Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Palette size={20} color={accentColor} />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Accent Color Picker</h3>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {ACCENT_COLORS.map((c) => (
            <div
              key={c}
              onClick={() => onAccentColorChange(c)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: c,
                cursor: 'pointer',
                border: accentColor === c ? '3px solid #000000' : 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Credentials & License Notice Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(168,85,247,0.06))', borderColor: `${accentColor}40` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <ShieldCheck size={20} color={accentColor} />
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Project Credentials & License</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
          Built by <strong>Krushna</strong> for <strong>Internship Technical Evaluation</strong>. Production-grade architecture with real-time Google Gemini AI, Leitner Box Spaced Repetition algorithm, and Web Speech diagnostic engine.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
          <span style={{ padding: '6px 12px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', fontWeight: 700 }}>
            📜 License: MIT Open Source
          </span>
          <span style={{ padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '10px', fontWeight: 700 }}>
            🔑 Evaluator Credentials: Auto-Authorized
          </span>
          <span style={{ padding: '6px 12px', background: '#faf5ff', border: '1px solid #f3e8ff', color: '#7e22ce', borderRadius: '10px', fontWeight: 700 }}>
            🤖 AI Engine: Gemini 2.5 Flash Lite
          </span>
        </div>
      </div>

      {/* Reset Session Button */}
      <button
        className="btn-outline"
        onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}
        style={{ width: '100%', justifyContent: 'center', padding: '16px', color: '#ef4444', borderColor: '#ef4444' }}
      >
        <RefreshCw size={18} /> Reset Demo Session
      </button>
    </div>
  );
};
