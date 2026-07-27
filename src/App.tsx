import React, { useState } from 'react';
import { Language, UserProgress, DailyQuest } from './types';
import { LocalDbService, CATEGORIES } from './services/localDb';
import { Navbar } from './components/Navbar';
import { SidebarNav } from './components/SidebarNav';
import { MobileDrawer } from './components/MobileDrawer';
import { LearnTab } from './components/Tabs/LearnTab';
import { AiTutorTab } from './components/Tabs/AiTutorTab';
import { AiStoriesTab } from './components/Tabs/AiStoriesTab';
import { AiScenarioTab } from './components/Tabs/AiScenarioTab';
import { LessonTab } from './components/Tabs/LessonTab';
import { QuizTab } from './components/Tabs/QuizTab';
import { QuestsTab } from './components/Tabs/QuestsTab';
import { ProfileTab } from './components/Tabs/ProfileTab';
import { LayoutGrid, Bot, Layers, User } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<Language>(LocalDbService.getTargetLanguage());
  const [accentColor, setAccentColor] = useState<string>('#58cc02');
  const [hearts, setHearts] = useState<number>(5);
  const [xp, setXp] = useState<number>(120);
  const [streak, setStreak] = useState<number>(5);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>(LocalDbService.getProgressMap());

  const [quests, setQuests] = useState<DailyQuest[]>([
    { id: 'quest_1', title: 'First Step', description: 'Complete 3 flashcards in the Lesson tab', target: 3, current: 1, rewardXp: 20, isCompleted: false },
    { id: 'quest_2', title: 'AI Tutor Chat', description: 'Send 2 messages to your AI Language Tutor', target: 2, current: 0, rewardXp: 30, isCompleted: false },
    { id: 'quest_3', title: 'Quiz Master', description: 'Complete 1 Category Quiz', target: 1, current: 0, rewardXp: 50, isCompleted: false },
  ]);

  const handleLanguageChange = (lang: Language) => {
    setTargetLanguage(lang);
    LocalDbService.setTargetLanguage(lang);
  };

  const handleRecordAttempt = (lessonId: string, isSuccess: boolean, pronunciationScore?: number) => {
    const current = progressMap[lessonId] || { lessonId, leitnerBox: 1, pronunciationScore: 0, quizScore: 0 };
    const nextBox = isSuccess ? Math.min(5, current.leitnerBox + 1) : 1;
    LocalDbService.saveProgress(lessonId, nextBox, pronunciationScore);
    setProgressMap(LocalDbService.getProgressMap());

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest_1' && !q.isCompleted) {
          const nextVal = Math.min(q.target, q.current + 1);
          return { ...q, current: nextVal, isCompleted: nextVal >= q.target };
        }
        return q;
      })
    );
  };

  const handleRewardXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const handleDeductHeart = () => {
    setHearts((prev) => Math.max(0, prev - 1));
  };

  const handleRefillHearts = () => {
    setHearts(5);
  };

  const handleQuizComplete = (catId: string, score: number, total: number) => {
    LocalDbService.saveQuizResult(catId, score, total);

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === 'quest_3' && !q.isCompleted) {
          return { ...q, current: 1, isCompleted: true };
        }
        return q;
      })
    );
  };

  const lessons = LocalDbService.getLessons(targetLanguage);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-main)' }}>
      {/* Desktop Navigation Sidebar */}
      <SidebarNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        accentColor={accentColor}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar
          currentLanguage={targetLanguage}
          onLanguageChange={handleLanguageChange}
          hearts={hearts}
          xp={xp}
          streak={streak}
          accentColor={accentColor}
          onOpenMobileDrawer={() => setIsDrawerOpen(true)}
        />

        <main style={{ flex: 1, paddingBottom: '80px' }}>
          {currentTab === 0 && (
            <LearnTab
              categories={CATEGORIES}
              lessons={lessons}
              progressMap={progressMap}
              accentColor={accentColor}
              onSelectCategory={() => setCurrentTab(4)}
              onStartLesson={() => setCurrentTab(4)}
            />
          )}
          {currentTab === 1 && (
            <AiTutorTab
              currentLanguage={targetLanguage}
              accentColor={accentColor}
              onRewardXp={handleRewardXp}
            />
          )}
          {currentTab === 2 && (
            <AiStoriesTab
              currentLanguage={targetLanguage}
              accentColor={accentColor}
              onRewardXp={handleRewardXp}
            />
          )}
          {currentTab === 3 && (
            <AiScenarioTab
              currentLanguage={targetLanguage}
              accentColor={accentColor}
              onRewardXp={handleRewardXp}
            />
          )}
          {currentTab === 4 && (
            <LessonTab
              lessons={lessons}
              progressMap={progressMap}
              accentColor={accentColor}
              onRecordAttempt={handleRecordAttempt}
            />
          )}
          {currentTab === 5 && (
            <QuizTab
              categories={CATEGORIES}
              lessons={lessons}
              accentColor={accentColor}
              onDeductHeart={handleDeductHeart}
              onRewardXp={handleRewardXp}
              onQuizComplete={handleQuizComplete}
            />
          )}
          {currentTab === 6 && (
            <QuestsTab
              hearts={hearts}
              maxHearts={5}
              xp={xp}
              quests={quests}
              accentColor={accentColor}
              onRefillHearts={handleRefillHearts}
            />
          )}
          {currentTab === 7 && (
            <ProfileTab
              currentLanguage={targetLanguage}
              onLanguageChange={handleLanguageChange}
              accentColor={accentColor}
              onAccentColorChange={setAccentColor}
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        accentColor={accentColor}
      />

      {/* Mobile 4-Item Primary Bottom Navigation Bar */}
      <nav
        className="glass-panel mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '62px',
          borderRadius: 0,
          borderBottom: 0,
          borderLeft: 0,
          borderRight: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 90,
        }}
      >
        <button
          onClick={() => setCurrentTab(0)}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: currentTab === 0 ? accentColor : 'var(--text-secondary)', fontWeight: currentTab === 0 ? 800 : 500, fontSize: '11px', cursor: 'pointer' }}
        >
          <LayoutGrid size={20} color={currentTab === 0 ? accentColor : 'var(--text-secondary)'} />
          <span>Learn</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: (currentTab >= 1 && currentTab <= 3) ? accentColor : 'var(--text-secondary)', fontWeight: (currentTab >= 1 && currentTab <= 3) ? 800 : 500, fontSize: '11px', cursor: 'pointer' }}
        >
          <Bot size={20} color={(currentTab >= 1 && currentTab <= 3) ? accentColor : 'var(--text-secondary)'} />
          <span>AI Hub</span>
        </button>

        <button
          onClick={() => setIsDrawerOpen(true)}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: (currentTab >= 4 && currentTab <= 6) ? accentColor : 'var(--text-secondary)', fontWeight: (currentTab >= 4 && currentTab <= 6) ? 800 : 500, fontSize: '11px', cursor: 'pointer' }}
        >
          <Layers size={20} color={(currentTab >= 4 && currentTab <= 6) ? accentColor : 'var(--text-secondary)'} />
          <span>Practice</span>
        </button>

        <button
          onClick={() => setCurrentTab(7)}
          style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: currentTab === 7 ? accentColor : 'var(--text-secondary)', fontWeight: currentTab === 7 ? 800 : 500, fontSize: '11px', cursor: 'pointer' }}
        >
          <User size={20} color={currentTab === 7 ? accentColor : 'var(--text-secondary)'} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
