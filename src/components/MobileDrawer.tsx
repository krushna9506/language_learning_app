import React from 'react';
import { Bot, BookOpenCheck, Compass, Layers, HelpCircle, Trophy, User, X, Sparkles } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: number;
  onSelectTab: (tabIdx: number) => void;
  accentColor: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  accentColor,
}) => {
  if (!isOpen) return null;

  const items = [
    { idx: 1, label: 'AI Tutor Chatbot', desc: 'Real-time Gemini conversational tutor', icon: Bot, badge: 'AI 2.5' },
    { idx: 2, label: 'AI Stories & Reader', desc: 'CEFR A1-C1 stories with tooltips', icon: BookOpenCheck, badge: 'CEFR' },
    { idx: 3, label: 'AI Scenario Roleplay', desc: 'Real-world situations & scorecards', icon: Compass, badge: 'Scorecard' },
    { idx: 4, label: 'Flashcard Lessons', desc: 'TTS audio & Leitner repetition', icon: Layers, badge: 'Leitner' },
    { idx: 5, label: 'Knowledge Quiz', desc: '15s timer & confetti rewards', icon: HelpCircle, badge: 'Timer' },
    { idx: 6, label: 'Quests & XP League', desc: 'Hearts, XP levels & leaderboards', icon: Trophy, badge: 'League' },
    { idx: 7, label: 'Profile & Settings', desc: 'Languages, API keys & themes', icon: User, badge: 'Settings' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Backdrop Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Slide-Up Container */}
      <div
        className="animate-slide-up glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: '24px 20px 40px',
          background: 'var(--card-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color={accentColor} />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Explore All Features</h3>
          </div>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={18} color="var(--text-primary)" />
          </button>
        </div>

        {/* Feature Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => {
            const IconComp = item.icon;
            const isSelected = currentTab === item.idx;
            return (
              <div
                key={item.idx}
                onClick={() => {
                  onSelectTab(item.idx);
                  onClose();
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  border: isSelected ? `2px solid ${accentColor}` : '1px solid var(--border-color)',
                  background: isSelected ? `${accentColor}10` : 'var(--bg-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComp size={20} color={accentColor} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.desc}</div>
                  </div>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px', background: isSelected ? accentColor : 'var(--card-bg)', color: isSelected ? '#ffffff' : 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  {item.badge}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
