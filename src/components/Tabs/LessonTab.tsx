import React, { useState } from 'react';
import { Language, Lesson, UserProgress } from '../../types';
import { GeminiService } from '../../services/gemini';
import { LevenshteinScorer } from '../../services/levenshtein';
import { Volume2, Sparkles, Mic, MicOff, CheckCircle2, RotateCcw } from 'lucide-react';

interface LessonTabProps {
  lessons: Lesson[];
  progressMap: Record<string, UserProgress>;
  accentColor: string;
  currentLanguage: Language;
  onRecordAttempt: (lessonId: string, isSuccess: boolean, pronunciationScore?: number) => void;
}

export const LessonTab: React.FC<LessonTabProps> = ({
  lessons,
  progressMap,
  accentColor,
  currentLanguage,
  onRecordAttempt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cachedSentence, setCachedSentence] = useState<{ sentence: string; translation: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechResult, setSpeechResult] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

  if (lessons.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No lessons available.</div>;
  }

  const currentLesson = lessons[currentIndex % lessons.length];
  const currentProgress = progressMap[currentLesson.id] || { lessonId: currentLesson.id, leitnerBox: 1, pronunciationScore: 0, quizScore: 0 };

  const handlePlayAudio = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(currentLesson.sourceWord);
      utterance.lang = currentLesson.audioLocale;
      window.speechSynthesis.speak(utterance);
    } catch (_) {
      alert(`Phonetic spelling: [ ${currentLesson.phonetic} ]`);
    }
  };

  const handleGenerateSentence = async () => {
    setIsGenerating(true);
    const res = await GeminiService.generateExampleSentence(
      currentLesson.sourceWord,
      currentLesson.translation,
      currentLanguage
    );
    setCachedSentence(res);
    setIsGenerating(false);
  };

  const handleMicPractice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const input = prompt(`Speak or type "${currentLesson.sourceWord}" (${currentLesson.phonetic}):`);
      if (input) {
        const score = LevenshteinScorer.calculateSimilarity(currentLesson.sourceWord, input);
        setSpeechResult(input);
        setPronunciationScore(score);
        onRecordAttempt(currentLesson.id, score >= 70, score);
      }
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = currentLesson.audioLocale;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        const score = LevenshteinScorer.calculateSimilarity(currentLesson.sourceWord, text);
        setSpeechResult(text);
        setPronunciationScore(score);
        setIsListening(false);
        onRecordAttempt(currentLesson.id, score >= 70, score);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch (_) {
      setIsListening(false);
    }
  };

  const handleNext = (isKnown: boolean) => {
    onRecordAttempt(currentLesson.id, isKnown);
    setCurrentIndex((prev) => (prev + 1) % lessons.length);
    setCachedSentence(null);
    setSpeechResult('');
    setPronunciationScore(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      {/* Header Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
          Card {currentIndex + 1} of {lessons.length}
        </span>
        <span style={{ background: `${accentColor}20`, color: accentColor, fontWeight: 800, padding: '4px 12px', borderRadius: '12px', fontSize: '13px' }}>
          Leitner Box {currentProgress.leitnerBox} / 5
        </span>
      </div>

      {/* Main Flashcard Card */}
      <div className="glass-panel" style={{ flex: 1, padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ fontSize: '38px', fontWeight: 900, color: accentColor, marginBottom: '8px' }}>{currentLesson.sourceWord}</h2>
        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>{currentLesson.translation}</div>
        <div style={{ fontSize: '14px', fontStyle: 'italic', opacity: 0.7, marginBottom: '24px' }}>Phonetic: [ {currentLesson.phonetic} ]</div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
          <button className="btn-outline" onClick={handlePlayAudio}>
            <Volume2 size={18} /> Play Audio
          </button>
          <button className="btn-outline" onClick={handleGenerateSentence} disabled={isGenerating}>
            <Sparkles size={18} color="#a855f7" /> {isGenerating ? 'Generating...' : 'See Example Sentence'}
          </button>
        </div>

        {/* Gemini Sentence Result */}
        {cachedSentence && (
          <div style={{ padding: '14px', background: '#faf5ff', border: '1px solid #f3e8ff', borderRadius: '14px', marginBottom: '20px', width: '100%' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#9333ea', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Sparkles size={14} /> AI Example Sentence
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>"{cachedSentence.sentence}"</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{cachedSentence.translation}</div>
          </div>
        )}

        {/* Mic Pronunciation Practice */}
        <button className="btn-outline" onClick={handleMicPractice} style={{ borderColor: isListening ? '#ef4444' : accentColor, color: isListening ? '#ef4444' : accentColor }}>
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? 'Listening...' : 'Practice Speaking'}
        </button>

        {pronunciationScore !== null && (
          <div style={{ marginTop: '12px', padding: '10px 16px', borderRadius: '12px', backgroundColor: `${LevenshteinScorer.getScoreColor(pronunciationScore)}20`, color: LevenshteinScorer.getScoreColor(pronunciationScore), fontWeight: 800 }}>
            Score: {pronunciationScore}% — {LevenshteinScorer.getScoreFeedbackLabel(pronunciationScore)}
          </div>
        )}
      </div>

      {/* Swipe Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
        <button className="btn-outline" onClick={() => handleNext(false)} style={{ justifyContent: 'center', borderColor: '#f97316', color: '#f97316' }}>
          <RotateCcw size={18} /> Needs Practice
        </button>
        <button className="btn-primary" onClick={() => handleNext(true)} style={{ justifyContent: 'center', backgroundColor: accentColor }}>
          <CheckCircle2 size={18} /> Mark as Known
        </button>
      </div>
    </div>
  );
};
