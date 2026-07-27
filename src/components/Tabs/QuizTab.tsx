import React, { useState, useEffect } from 'react';
import { Category, Lesson } from '../../types';
import confetti from 'canvas-confetti';
import { Trophy, Timer, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface QuizTabProps {
  categories: Category[];
  lessons: Lesson[];
  accentColor: string;
  onDeductHeart: () => void;
  onRewardXp: (amount: number) => void;
  onQuizComplete: (catId: string, score: number, total: number) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  categories,
  lessons,
  accentColor,
  onDeductHeart,
  onRewardXp,
  onQuizComplete,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizLessons, setQuizLessons] = useState<Lesson[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    let interval: any;
    if (selectedCatId && !quizDone && selectedOption === null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleOptionSelect(''); // time out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedCatId, questionIdx, quizDone, selectedOption]);

  const startQuiz = (catId: string) => {
    const catLessons = lessons.filter((l) => l.categoryId === catId);
    if (catLessons.length === 0) {
      alert('No questions available for this category yet.');
      return;
    }
    setSelectedCatId(catId);
    setQuizLessons(catLessons);
    setQuestionIdx(0);
    setScore(0);
    setQuizDone(false);
    loadQuestion(0, catLessons);
  };

  const loadQuestion = (idx: number, list: Lesson[]) => {
    if (idx >= list.length) {
      finishQuiz();
      return;
    }
    const current = list[idx];
    const wrong = lessons
      .filter((l) => l.id !== current.id)
      .map((l) => l.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opts = [...wrong, current.translation].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelectedOption(null);
    setTimerSeconds(15);
  };

  const handleOptionSelect = (opt: string) => {
    if (selectedOption !== null) return;
    const current = quizLessons[questionIdx];
    const isCorrect = opt === current.translation;

    setSelectedOption(opt);
    if (isCorrect) {
      setScore((prev) => prev + 1);
      onRewardXp(10);
    } else {
      onDeductHeart();
    }
  };

  const nextQuestion = () => {
    if (questionIdx + 1 >= quizLessons.length) {
      finishQuiz();
    } else {
      const nextIdx = questionIdx + 1;
      setQuestionIdx(nextIdx);
      loadQuestion(nextIdx, quizLessons);
    }
  };

  const finishQuiz = () => {
    setQuizDone(true);
    if (selectedCatId) {
      onQuizComplete(selectedCatId, score, quizLessons.length);
    }
    onRewardXp(30);

    if (score === quizLessons.length && quizLessons.length > 0) {
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}
    }
  };

  if (!selectedCatId) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>Knowledge Quiz</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Select a category to test your mastery</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {categories.map((cat) => (
            <div key={cat.id} className="hover-card glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{cat.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{cat.description}</p>
              </div>
              <button className="btn-primary" onClick={() => startQuiz(cat.id)} style={{ backgroundColor: accentColor }}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (quizDone) {
    const isPerfect = score === quizLessons.length && quizLessons.length > 0;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
        <Trophy size={72} color={isPerfect ? '#eab308' : accentColor} style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px' }}>
          {isPerfect ? 'PERFECT SCORE! 🎉' : 'Quiz Complete!'}
        </h2>
        <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '24px' }}>
          You scored {score} / {quizLessons.length} correct
        </p>
        <button className="btn-primary" onClick={() => setSelectedCatId(null)} style={{ backgroundColor: accentColor }}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentLesson = quizLessons[questionIdx];

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <span style={{ fontWeight: 700 }}>Question {questionIdx + 1} of {quizLessons.length}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: timerSeconds <= 5 ? '#fef2f2' : '#eff6ff', border: `1px solid ${timerSeconds <= 5 ? '#fecaca' : '#bfdbfe'}`, padding: '6px 12px', borderRadius: '16px', color: timerSeconds <= 5 ? '#ef4444' : '#3b82f6', fontWeight: 800 }}>
          <Timer size={16} /> {timerSeconds}s
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>What is the translation of:</div>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: accentColor }}>"{currentLesson.sourceWord}"</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {options.map((opt) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentLesson.translation;
          let btnStyle = { border: '2px solid var(--border-color)', background: 'var(--card-bg)' };

          if (selectedOption !== null) {
            if (isCorrect) btnStyle = { border: '2px solid #22c55e', background: '#f0fdf4' };
            else if (isSelected) btnStyle = { border: '2px solid #ef4444', background: '#fef2f2' };
          }

          return (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              style={{
                ...btnStyle,
                padding: '16px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <button className="btn-primary" onClick={nextQuestion} style={{ backgroundColor: accentColor, marginTop: '20px', justifyContent: 'center' }}>
          {questionIdx + 1 === quizLessons.length ? 'Finish Quiz' : 'Next Question'}
        </button>
      )}
    </div>
  );
};
