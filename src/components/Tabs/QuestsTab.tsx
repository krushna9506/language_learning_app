import React from 'react';
import { DailyQuest } from '../../types';
import { Heart, Zap, Trophy, CheckCircle2, Star } from 'lucide-react';

interface QuestsTabProps {
  hearts: number;
  maxHearts: number;
  xp: number;
  quests: DailyQuest[];
  accentColor: string;
  onRefillHearts: () => void;
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  hearts,
  maxHearts,
  xp,
  quests,
  accentColor,
  onRefillHearts,
}) => {
  const getLeagueName = (points: number) => {
    if (points >= 500) return 'Diamond League 💎';
    if (points >= 300) return 'Sapphire League 🔷';
    if (points >= 200) return 'Gold League 🏆';
    if (points >= 100) return 'Silver League 🥈';
    return 'Bronze League 🥉';
  };

  const xpProgress = (xp % 100) / 100;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Quests & Leagues</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Duolingo-style hearts, XP levels, and daily achievements
      </p>

      {/* Hearts & XP Status Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Hearts Status */}
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
              {Array.from({ length: maxHearts }).map((_, i) => (
                <Heart key={i} size={24} color="#ef4444" fill={i < hearts ? '#ef4444' : 'transparent'} />
              ))}
            </div>
            <div style={{ fontWeight: 800, fontSize: '18px' }}>{hearts} / {maxHearts} Hearts Left</div>
            {hearts < maxHearts && (
              <button className="btn-outline" onClick={onRefillHearts} style={{ marginTop: '8px', fontSize: '12px', padding: '6px 14px' }}>
                Refill Hearts ❤️
              </button>
            )}
          </div>

          {/* XP & League Status */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <Zap size={28} color="#eab308" fill="#eab308" />
              <span style={{ fontSize: '26px', fontWeight: 900, color: '#ca8a04' }}>{xp} XP</span>
            </div>
            <div style={{ fontWeight: 800, color: accentColor, fontSize: '15px' }}>{getLeagueName(xp)}</div>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '6px' }}>
            <span>Next Level Progress</span>
            <span>{Math.round(xpProgress * 100)}%</span>
          </div>
          <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpProgress * 100}%`, backgroundColor: accentColor, borderRadius: '5px', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Daily Quests</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {quests.map((quest) => {
          const pct = Math.min(1, quest.current / quest.target);
          return (
            <div key={quest.id} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: quest.isCompleted ? '#f0fdf4' : `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {quest.isCompleted ? <CheckCircle2 size={24} color="#22c55e" /> : <Star size={24} color={accentColor} />}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800 }}>{quest.title}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{quest.description}</p>
                  </div>
                </div>
                <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, color: '#ca8a04', fontSize: '12px' }}>
                  +{quest.rewardXp} XP
                </div>
              </div>
              <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: quest.isCompleted ? '#22c55e' : accentColor, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
