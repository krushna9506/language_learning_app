import React, { useState, useEffect } from 'react';
import { Language, Story } from '../../types';
import { AiOrchestrator } from '../../services/aiOrchestrator';
import { BookOpenCheck, Sparkles, HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AiStoriesTabProps {
  currentLanguage: Language;
  accentColor: string;
  onRewardXp: (amount: number) => void;
}

const LEVELS: ('A1' | 'A2' | 'B1' | 'B2' | 'C1')[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const AiStoriesTab: React.FC<AiStoriesTabProps> = ({
  currentLanguage,
  accentColor,
  onRewardXp,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1'>('A1');
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    loadStory();
  }, [currentLanguage, selectedLevel]);

  const loadStory = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setQuizAnswered(false);
    const s = await AiOrchestrator.generateAiStory(currentLanguage, selectedLevel);
    setStory(s);
    setIsLoading(false);
  };

  const handleAnswer = (idx: number) => {
    if (quizAnswered || !story) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);

    const q = story.questions[0];
    if (idx === q.correctIndex) {
      onRewardXp(25);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800 }}>AI Reader & Stories</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            CEFR Level-tailored AI short stories with inline tooltips & comprehension check
          </p>
        </div>
        <button className="btn-outline" onClick={loadStory} disabled={isLoading}>
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> New Story
        </button>
      </div>

      {/* CEFR Level Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            style={{
              padding: '8px 16px',
              borderRadius: '16px',
              fontWeight: 800,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: selectedLevel === lvl ? accentColor : 'var(--card-bg)',
              color: selectedLevel === lvl ? '#ffffff' : 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
          >
            {lvl} Level
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Sparkles size={36} color={accentColor} style={{ marginBottom: '12px' }} />
          <div style={{ fontWeight: 700 }}>AI is generating a CEFR {selectedLevel} {currentLanguage} Story...</div>
        </div>
      ) : story ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Story Card */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: accentColor }}>{story.title}</h3>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{story.titleTranslation}</div>
              </div>
              <span style={{ background: `${accentColor}20`, color: accentColor, fontWeight: 800, padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                {story.level}
              </span>
            </div>

            <p style={{ fontSize: '18px', lineHeight: 1.7, fontWeight: 500, margin: '20px 0' }}>
              {story.content}
            </p>

            <div style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: '14px', fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Translation: "{story.contentTranslation}"
            </div>
          </div>

          {/* Vocab Hints Box */}
          {Object.keys(story.vocabHints).length > 0 && (
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpenCheck size={18} color={accentColor} /> Key Vocabulary Tooltips
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {Object.entries(story.vocabHints).map(([word, hint]) => (
                  <div key={word} style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, padding: '6px 12px', borderRadius: '12px', fontSize: '13px' }}>
                    <strong style={{ color: accentColor }}>{word}</strong> = {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprehension Quiz Card */}
          {story.questions.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={18} color="#eab308" /> Comprehension Check (+25 XP)
              </h4>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                {story.questions[0].question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {story.questions[0].options.map((opt, idx) => {
                  const isCorrect = idx === story.questions[0].correctIndex;
                  const isSelected = selectedAnswer === idx;
                  let bg = 'var(--bg-main)';
                  let border = '1px solid var(--border-color)';

                  if (quizAnswered) {
                    if (isCorrect) {
                      bg = '#f0fdf4';
                      border = '2px solid #22c55e';
                    } else if (isSelected) {
                      bg = '#fef2f2';
                      border = '2px solid #ef4444';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(idx)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border,
                        background: bg,
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
