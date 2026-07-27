import React from 'react';
import { Category, Lesson, UserProgress } from '../../types';
import { LeitnerService } from '../../services/leitner';
import { BookOpen, BookMarked, Plane, Utensils, MessageCircle, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LearnTabProps {
  categories: Category[];
  lessons: Lesson[];
  progressMap: Record<string, UserProgress>;
  accentColor: string;
  onSelectCategory: (catId: string) => void;
  onStartLesson: () => void;
}

const getCategoryIcon = (iconName: string, color: string) => {
  switch (iconName) {
    case 'BookOpen': return <BookOpen size={32} color={color} />;
    case 'BookMarked': return <BookMarked size={32} color={color} />;
    case 'Plane': return <Plane size={32} color={color} />;
    case 'Utensils': return <Utensils size={32} color={color} />;
    case 'MessageCircle': return <MessageCircle size={32} color={color} />;
    default: return <BookOpen size={32} color={color} />;
  }
};

export const LearnTab: React.FC<LearnTabProps> = ({
  categories,
  lessons,
  progressMap,
  accentColor,
  onSelectCategory,
  onStartLesson,
}) => {
  const prioritizedQueue = LeitnerService.prioritizeQueue(lessons, progressMap);
  const topQueueItem = prioritizedQueue[0];

  const getCategoryMastery = (catId: string) => {
    const catLessons = lessons.filter((l) => l.categoryId === catId);
    if (catLessons.length === 0) return 0;
    const masteredCount = catLessons.filter((l) => {
      const prog = progressMap[l.id];
      return prog && prog.quizScore >= 70 && prog.pronunciationScore >= 70;
    }).length;
    return Math.round((masteredCount / catLessons.length) * 100);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Your Learning Path</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Real-time local database sync & Leitner Spaced Repetition queue
        </p>
      </div>

      {/* Daily Leitner Queue Banner */}
      {topQueueItem && (
        <div
          className="hover-card glass-panel"
          onClick={onStartLesson}
          style={{
            padding: '20px',
            marginBottom: '32px',
            background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
            borderColor: `${accentColor}40`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>Daily Leitner Review Queue</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Next up: <strong style={{ color: 'var(--text-primary)' }}>"{topQueueItem.sourceWord}"</strong> ({topQueueItem.translation})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: accentColor, fontWeight: 700, fontSize: '14px' }}>
            Practice Now <ArrowRight size={18} />
          </div>
        </div>
      )}

      <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Categories</h3>

      {/* Category Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {categories.map((cat) => {
          const pct = getCategoryMastery(cat.id);
          return (
            <div
              key={cat.id}
              className="hover-card glass-panel"
              onClick={() => onSelectCategory(cat.id)}
              style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                  <circle cx="40" cy="40" r="34" stroke="var(--border-color)" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={accentColor}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={213.6}
                    strokeDashoffset={213.6 - (213.6 * pct) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                {getCategoryIcon(cat.iconName, accentColor)}
              </div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{cat.title}</h4>
              <div style={{ fontSize: '13px', fontWeight: 700, color: pct > 0 ? accentColor : 'var(--text-secondary)' }}>
                {pct}% Mastered
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
