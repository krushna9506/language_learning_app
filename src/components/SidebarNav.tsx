import React from 'react';
import { Language } from '../types';
import { LayoutGrid, Bot, BookOpenCheck, Compass, Layers, HelpCircle, Trophy, User, Globe, Sparkles } from 'lucide-react';

interface SidebarNavProps {
  currentTab: number;
  onSelectTab: (tabIdx: number) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  accentColor: string;
}

const LANGUAGES: Language[] = ['French', 'Spanish', 'German', 'Italian', 'Japanese', 'Mandarin'];

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  currentLanguage,
  onLanguageChange,
  accentColor,
}) => {
  const tabs = [
    { label: 'Learn Path', icon: LayoutGrid },
    { label: 'AI Tutor', icon: Bot },
    { label: 'AI Stories', icon: BookOpenCheck },
    { label: 'AI Scenarios', icon: Compass },
    { label: 'Flashcard Lessons', icon: Layers },
    { label: 'Knowledge Quiz', icon: HelpCircle },
    { label: 'Quests & Leagues', icon: Trophy },
    { label: 'Profile & Settings', icon: User },
  ];

  return (
    <aside
      className="glass-panel desktop-only"
      style={{
        width: '260px',
        minHeight: '100vh',
        borderRadius: 0,
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 90,
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '14px', backgroundColor: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Globe size={26} color={accentColor} />
        </div>
        <div>
          <h1 className="brand-title" style={{ fontSize: '22px', fontWeight: 900, lineHeight: 1.1 }}>LinguaPop</h1>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>AI Multi-Language</span>
        </div>
      </div>

      {/* Target Language Selector */}
      <div style={{ marginBottom: '24px', padding: '0 8px' }}>
        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
          Learning Language
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '14px' }}>
          <Globe size={16} color={accentColor} />
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as Language)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 800, fontSize: '13px', cursor: 'pointer', outline: 'none' }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tabs.map((t, idx) => {
          const IconComp = t.icon;
          const isActive = currentTab === idx;
          return (
            <button
              key={t.label}
              onClick={() => onSelectTab(idx)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                border: 'none',
                background: isActive ? `${accentColor}15` : 'transparent',
                color: isActive ? accentColor : 'var(--text-primary)',
                fontWeight: isActive ? 800 : 600,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <IconComp size={20} color={isActive ? accentColor : 'var(--text-secondary)'} />
              <span style={{ flex: 1 }}>{t.label}</span>
              {isActive && (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: accentColor }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div style={{ padding: '16px 8px 0', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color={accentColor} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Gemini 2.5 Flash Active
        </span>
      </div>
    </aside>
  );
};
