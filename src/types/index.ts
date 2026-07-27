export type Language = 'French' | 'Spanish' | 'German' | 'Italian' | 'Japanese' | 'Mandarin';

export interface Category {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface Lesson {
  id: string;
  categoryId: string;
  sourceWord: string;
  translation: string;
  phonetic: string;
  audioLocale: string;
  cachedSentence?: string;
  cachedSentenceTranslation?: string;
}

export interface UserProgress {
  lessonId: string;
  leitnerBox: number; // 1 to 5
  pronunciationScore: number; // 0 to 100
  quizScore: number; // 0 to 100
  lastReviewed?: string;
}

export interface QuizResult {
  id: string;
  categoryId: string;
  score: number;
  total: number;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  translation?: string;
  correction?: string;
  isUser: boolean;
  timestamp: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  isCompleted: boolean;
}

export interface ApiKeyConfig {
  geminiKey?: string;
  huggingFaceKey?: string;
  openRouterKey?: string;
}

export interface StoryQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Story {
  title: string;
  titleTranslation: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  content: string;
  contentTranslation: string;
  vocabHints: Record<string, string>;
  questions: StoryQuestion[];
}

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  initialMessage: string;
  initialTranslation: string;
}
