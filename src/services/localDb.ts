import { Category, Language, Lesson, QuizResult, UserProgress } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'vocab', title: 'Vocabulary', description: 'Essential everyday words', iconName: 'BookOpen' },
  { id: 'grammar', title: 'Grammar', description: 'Verb tenses & sentence structure', iconName: 'BookMarked' },
  { id: 'travel', title: 'Travel', description: 'Airport, hotel, & navigation', iconName: 'Plane' },
  { id: 'dining', title: 'Food & Dining', description: 'Restaurants, menus & ordering', iconName: 'Utensils' },
  { id: 'daily', title: 'Daily Life', description: 'Routine conversations & greetings', iconName: 'MessageCircle' },
];

export const MULTI_LANGUAGE_LESSONS: Record<Language, Lesson[]> = {
  French: [
    { id: 'fr_bonjour', categoryId: 'vocab', sourceWord: 'Bonjour', translation: 'Hello / Good day', phonetic: 'bohn-zhoor', audioLocale: 'fr-FR' },
    { id: 'fr_merci', categoryId: 'vocab', sourceWord: 'Merci', translation: 'Thank you', phonetic: 'mehr-see', audioLocale: 'fr-FR' },
    { id: 'fr_chat', categoryId: 'vocab', sourceWord: 'Chat', translation: 'Cat', phonetic: 'shah', audioLocale: 'fr-FR' },
    { id: 'fr_chien', categoryId: 'vocab', sourceWord: 'Chien', translation: 'Dog', phonetic: 'shee-en', audioLocale: 'fr-FR' },
    { id: 'fr_etre', categoryId: 'grammar', sourceWord: 'Être', translation: 'To be', phonetic: 'eh-truh', audioLocale: 'fr-FR' },
    { id: 'fr_avoir', categoryId: 'grammar', sourceWord: 'Avoir', translation: 'To have', phonetic: 'ah-vwahr', audioLocale: 'fr-FR' },
    { id: 'fr_aller', categoryId: 'grammar', sourceWord: 'Aller', translation: 'To go', phonetic: 'ah-lay', audioLocale: 'fr-FR' },
    { id: 'fr_voyage', categoryId: 'travel', sourceWord: 'Voyage', translation: 'Trip / Travel', phonetic: 'vwah-yazh', audioLocale: 'fr-FR' },
    { id: 'fr_passeport', categoryId: 'travel', sourceWord: 'Passeport', translation: 'Passport', phonetic: 'pahss-pohr', audioLocale: 'fr-FR' },
    { id: 'fr_hotel', categoryId: 'travel', sourceWord: 'Hôtel', translation: 'Hotel', phonetic: 'oh-tel', audioLocale: 'fr-FR' },
    { id: 'fr_menu', categoryId: 'dining', sourceWord: 'Menu', translation: 'Menu', phonetic: 'muh-nyoo', audioLocale: 'fr-FR' },
    { id: 'fr_eau', categoryId: 'dining', sourceWord: 'Eau', translation: 'Water', phonetic: 'oh', audioLocale: 'fr-FR' },
    { id: 'fr_pain', categoryId: 'dining', sourceWord: 'Pain', translation: 'Bread', phonetic: 'pan', audioLocale: 'fr-FR' },
    { id: 'fr_salut', categoryId: 'daily', sourceWord: 'Salut', translation: 'Hi / Bye', phonetic: 'sah-lyoo', audioLocale: 'fr-FR' },
    { id: 'fr_oui', categoryId: 'daily', sourceWord: 'Oui', translation: 'Yes', phonetic: 'wee', audioLocale: 'fr-FR' },
    { id: 'fr_non', categoryId: 'daily', sourceWord: 'Non', translation: 'No', phonetic: 'noh', audioLocale: 'fr-FR' },
  ],
  Spanish: [
    { id: 'es_hola', categoryId: 'vocab', sourceWord: 'Hola', translation: 'Hello', phonetic: 'oh-lah', audioLocale: 'es-ES' },
    { id: 'es_gracias', categoryId: 'vocab', sourceWord: 'Gracias', translation: 'Thank you', phonetic: 'grah-see-ahs', audioLocale: 'es-ES' },
    { id: 'es_gato', categoryId: 'vocab', sourceWord: 'Gato', translation: 'Cat', phonetic: 'gah-toh', audioLocale: 'es-ES' },
    { id: 'es_perro', categoryId: 'vocab', sourceWord: 'Perro', translation: 'Dog', phonetic: 'peh-rroh', audioLocale: 'es-ES' },
    { id: 'es_ser', categoryId: 'grammar', sourceWord: 'Ser', translation: 'To be', phonetic: 'sehr', audioLocale: 'es-ES' },
    { id: 'es_estar', categoryId: 'grammar', sourceWord: 'Estar', translation: 'To be (state)', phonetic: 'ehs-tahr', audioLocale: 'es-ES' },
    { id: 'es_tener', categoryId: 'grammar', sourceWord: 'Tener', translation: 'To have', phonetic: 'teh-nehr', audioLocale: 'es-ES' },
    { id: 'es_viaje', categoryId: 'travel', sourceWord: 'Viaje', translation: 'Trip / Travel', phonetic: 'vyah-heh', audioLocale: 'es-ES' },
    { id: 'es_pasaporte', categoryId: 'travel', sourceWord: 'Pasaporte', translation: 'Passport', phonetic: 'pah-sah-pohr-teh', audioLocale: 'es-ES' },
    { id: 'es_hotel', categoryId: 'travel', sourceWord: 'Hotel', translation: 'Hotel', phonetic: 'oh-tehl', audioLocale: 'es-ES' },
    { id: 'es_menu', categoryId: 'dining', sourceWord: 'Menú', translation: 'Menu', phonetic: 'meh-noo', audioLocale: 'es-ES' },
    { id: 'es_agua', categoryId: 'dining', sourceWord: 'Agua', translation: 'Water', phonetic: 'ah-gwah', audioLocale: 'es-ES' },
    { id: 'es_pan', categoryId: 'dining', sourceWord: 'Pan', translation: 'Bread', phonetic: 'pahn', audioLocale: 'es-ES' },
    { id: 'es_si', categoryId: 'daily', sourceWord: 'Sí', translation: 'Yes', phonetic: 'see', audioLocale: 'es-ES' },
    { id: 'es_no', categoryId: 'daily', sourceWord: 'No', translation: 'No', phonetic: 'noh', audioLocale: 'es-ES' },
  ],
  German: [
    { id: 'de_hallo', categoryId: 'vocab', sourceWord: 'Hallo', translation: 'Hello', phonetic: 'hah-loh', audioLocale: 'de-DE' },
    { id: 'de_danke', categoryId: 'vocab', sourceWord: 'Danke', translation: 'Thank you', phonetic: 'dahn-kuh', audioLocale: 'de-DE' },
    { id: 'de_katze', categoryId: 'vocab', sourceWord: 'Katze', translation: 'Cat', phonetic: 'kaht-suh', audioLocale: 'de-DE' },
    { id: 'de_hund', categoryId: 'vocab', sourceWord: 'Hund', translation: 'Dog', phonetic: 'hoond', audioLocale: 'de-DE' },
    { id: 'de_sein', categoryId: 'grammar', sourceWord: 'Sein', translation: 'To be', phonetic: 'zayn', audioLocale: 'de-DE' },
    { id: 'de_haben', categoryId: 'grammar', sourceWord: 'Haben', translation: 'To have', phonetic: 'hah-buhn', audioLocale: 'de-DE' },
    { id: 'de_reise', categoryId: 'travel', sourceWord: 'Reise', translation: 'Trip / Travel', phonetic: 'rye-zuh', audioLocale: 'de-DE' },
    { id: 'de_hotel', categoryId: 'travel', sourceWord: 'Hotel', translation: 'Hotel', phonetic: 'hoh-tel', audioLocale: 'de-DE' },
    { id: 'de_wasser', categoryId: 'dining', sourceWord: 'Wasser', translation: 'Water', phonetic: 'vahs-suhr', audioLocale: 'de-DE' },
    { id: 'de_ja', categoryId: 'daily', sourceWord: 'Ja', translation: 'Yes', phonetic: 'yah', audioLocale: 'de-DE' },
    { id: 'de_nein', categoryId: 'daily', sourceWord: 'Nein', translation: 'No', phonetic: 'nine', audioLocale: 'de-DE' },
  ],
  Italian: [
    { id: 'it_ciao', categoryId: 'vocab', sourceWord: 'Ciao', translation: 'Hello / Bye', phonetic: 'chow', audioLocale: 'it-IT' },
    { id: 'it_grazie', categoryId: 'vocab', sourceWord: 'Grazie', translation: 'Thank you', phonetic: 'grah-tsee-eh', audioLocale: 'it-IT' },
    { id: 'it_gatto', categoryId: 'vocab', sourceWord: 'Gatto', translation: 'Cat', phonetic: 'gaht-toh', audioLocale: 'it-IT' },
    { id: 'it_essere', categoryId: 'grammar', sourceWord: 'Essere', translation: 'To be', phonetic: 'ehs-seh-reh', audioLocale: 'it-IT' },
    { id: 'it_viaggio', categoryId: 'travel', sourceWord: 'Viaggio', translation: 'Trip / Travel', phonetic: 'vyahd-joh', audioLocale: 'it-IT' },
    { id: 'it_menu', categoryId: 'dining', sourceWord: 'Menu', translation: 'Menu', phonetic: 'meh-noo', audioLocale: 'it-IT' },
    { id: 'it_acqua', categoryId: 'dining', sourceWord: 'Acqua', translation: 'Water', phonetic: 'ahk-wah', audioLocale: 'it-IT' },
    { id: 'it_si', categoryId: 'daily', sourceWord: 'Sì', translation: 'Yes', phonetic: 'see', audioLocale: 'it-IT' },
  ],
  Japanese: [
    { id: 'ja_konnichiwa', categoryId: 'vocab', sourceWord: 'こんにちは', translation: 'Hello', phonetic: 'Konnichiwa', audioLocale: 'ja-JP' },
    { id: 'ja_arigatou', categoryId: 'vocab', sourceWord: 'ありがとう', translation: 'Thank you', phonetic: 'Arigatou', audioLocale: 'ja-JP' },
    { id: 'ja_neko', categoryId: 'vocab', sourceWord: '猫 (ねこ)', translation: 'Cat', phonetic: 'Neko', audioLocale: 'ja-JP' },
    { id: 'ja_desu', categoryId: 'grammar', sourceWord: 'です', translation: 'To be', phonetic: 'Desu', audioLocale: 'ja-JP' },
    { id: 'ja_ryokou', categoryId: 'travel', sourceWord: '旅行 (りょこう)', translation: 'Trip / Travel', phonetic: 'Ryokou', audioLocale: 'ja-JP' },
    { id: 'ja_mizu', categoryId: 'dining', sourceWord: '水 (みず)', translation: 'Water', phonetic: 'Mizu', audioLocale: 'ja-JP' },
    { id: 'ja_hai', categoryId: 'daily', sourceWord: 'はい', translation: 'Yes', phonetic: 'Hai', audioLocale: 'ja-JP' },
  ],
  Mandarin: [
    { id: 'zh_nihao', categoryId: 'vocab', sourceWord: '你好', translation: 'Hello', phonetic: 'Nǐ hǎo', audioLocale: 'zh-CN' },
    { id: 'zh_xiexie', categoryId: 'vocab', sourceWord: '谢谢', translation: 'Thank you', phonetic: 'Xiè xie', audioLocale: 'zh-CN' },
    { id: 'zh_mao', categoryId: 'vocab', sourceWord: '猫', translation: 'Cat', phonetic: 'Māo', audioLocale: 'zh-CN' },
    { id: 'zh_shi', categoryId: 'grammar', sourceWord: '是', translation: 'To be', phonetic: 'Shì', audioLocale: 'zh-CN' },
    { id: 'zh_lvyou', categoryId: 'travel', sourceWord: '旅游', translation: 'Trip / Travel', phonetic: 'Lǚ yóu', audioLocale: 'zh-CN' },
    { id: 'zh_shui', categoryId: 'dining', sourceWord: '水', translation: 'Water', phonetic: 'Shuǐ', audioLocale: 'zh-CN' },
    { id: 'zh_dui', categoryId: 'daily', sourceWord: '对', translation: 'Yes', phonetic: 'Duì', audioLocale: 'zh-CN' },
  ],
};

const STORAGE_KEYS = {
  LANGUAGE: 'linguapop_target_language',
  PROGRESS: 'linguapop_progress',
  QUIZ_RESULTS: 'linguapop_quiz_results',
};

export class LocalDbService {
  static getTargetLanguage(): Language {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'French';
  }

  static setTargetLanguage(lang: Language) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }

  static getLessons(language: Language): Lesson[] {
    return MULTI_LANGUAGE_LESSONS[language] || MULTI_LANGUAGE_LESSONS.French;
  }

  static getProgressMap(): Record<string, UserProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!data) {
        // Initial seed demo progress
        return {
          fr_bonjour: { lessonId: 'fr_bonjour', leitnerBox: 2, pronunciationScore: 85, quizScore: 100, lastReviewed: new Date(Date.now() - 86400000).toISOString() },
          fr_merci: { lessonId: 'fr_merci', leitnerBox: 1, pronunciationScore: 90, quizScore: 100, lastReviewed: new Date().toISOString() },
        };
      }
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  static saveProgress(lessonId: string, leitnerBox: number, pronunciationScore?: number, quizScore?: number) {
    const map = this.getProgressMap();
    const existing = map[lessonId] || { lessonId, leitnerBox: 1, pronunciationScore: 0, quizScore: 0 };

    map[lessonId] = {
      lessonId,
      leitnerBox,
      pronunciationScore: pronunciationScore !== undefined ? Math.max(existing.pronunciationScore, pronunciationScore) : existing.pronunciationScore,
      quizScore: quizScore !== undefined ? Math.max(existing.quizScore, quizScore) : existing.quizScore,
      lastReviewed: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(map));
  }

  static getQuizResults(): QuizResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveQuizResult(categoryId: string, score: number, total: number) {
    const list = this.getQuizResults();
    const result: QuizResult = {
      id: Date.now().toString(),
      categoryId,
      score,
      total,
      completedAt: new Date().toISOString(),
    };
    list.unshift(result);
    localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(list));
  }
}
