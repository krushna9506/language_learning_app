import React from 'react';
import { Language } from '../types';
import { Flame, Heart, Zap, Globe, Menu } from 'lucide-react';

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  hearts: number;
  xp: number;
  streak: number;
  accentColor: string;
  onOpenMobileDrawer?: () => void;
}

const LANGUAGES: Language[] = ['French', 'Spanish', 'German', 'Italian', 'Japanese', 'Mandarin'];

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  hearts,
  xp,
  streak,
  accentColor,
  onOpenMobileDrawer,
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        borderRadius: 0,
        borderTop: 0,
        borderLeft: 0,
        borderRight: 0,
        position: 'sticky',
        top: 0,
        zIndex: 90,
        padding: '12px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand & Mobile Menu Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onOpenMobileDrawer}
              style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Menu size={20} color="var(--text-primary)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Globe size={20} color={accentColor} />
              </div>
              <h1 className="brand-title" style={{ fontSize: '18px', fontWeight: 800 }}>LinguaPop</h1>
            </div>
          </div>

          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Welcome back, Demo Reviewer!</span>
          </div>
        </div>

        {/* Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Hearts Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '18px' }}>
            <Heart size={15} color="#ef4444" fill="#ef4444" />
            <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '12px' }}>{hearts}</span>
          </div>

          {/* XP Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fefce8', border: '1px solid #fef08a', padding: '6px 10px', borderRadius: '18px' }}>
            <Zap size={15} color="#eab308" fill="#eab308" />
            <span style={{ fontWeight: 800, color: '#ca8a04', fontSize: '12px' }}>{xp} XP</span>
          </div>

          {/* Streak Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff7ed', border: '1px solid #ffedd5', padding: '6px 10px', borderRadius: '18px' }}>
            <Flame size={15} color="#f97316" fill="#f97316" />
            <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '12px' }}>{streak}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
