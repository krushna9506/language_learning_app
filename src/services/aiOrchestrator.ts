import { ApiKeyConfig, Language, RoleplayScenario, Story } from '../types';

const STORAGE_KEY = 'linguapop_api_keys';

export class AiOrchestrator {
  static getApiKeys(): ApiKeyConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveApiKeys(config: ApiKeyConfig) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  static getActiveGeminiKey(): string {
    const keys = this.getApiKeys();
    if (keys.geminiKey && keys.geminiKey.trim().length > 5) {
      return keys.geminiKey.trim();
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  static async validateKey(provider: 'gemini' | 'huggingface' | 'openrouter', key: string): Promise<boolean> {
    if (!key || key.trim().length < 5) return false;

    if (provider === 'gemini') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }]
          })
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    return true; // Simplified validation for HF/OpenRouter
  }

  static async generateAiStory(language: Language, level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'): Promise<Story> {
    const key = this.getActiveGeminiKey();

    if (key && !key.includes('DummyKey')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;
        const prompt = `Generate a short engaging story in ${language} at CEFR level ${level} (3-5 sentences).
Return strictly a JSON object with keys:
- "title": Title in ${language}
- "titleTranslation": English title
- "content": Story text in ${language}
- "contentTranslation": English translation of full story
- "vocabHints": JSON map of 3 difficult words in ${language} to their English translation
- "questions": Array of 1 comprehension question object with keys "question", "options" (array of 3 strings), "correctIndex" (0, 1, or 2).

Do not include markdown code blocks.`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const clean = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          return {
            title: parsed.title || `Un Jour à Paris`,
            titleTranslation: parsed.titleTranslation || `A Day in Paris`,
            level,
            content: parsed.content || `C'est une belle journée. Pierre marche dans le parc et achète un croissant.`,
            contentTranslation: parsed.contentTranslation || `It is a beautiful day. Pierre walks in the park and buys a croissant.`,
            vocabHints: parsed.vocabHints || { 'marcher': 'to walk', 'journée': 'day', 'croissant': 'croissant' },
            questions: parsed.questions || [
              {
                question: 'Que fait Pierre dans le parc?',
                options: ['Il dort', ['Il achète un croissant'], 'Il nage'],
                correctIndex: 1,
              }
            ]
          };
        }
      } catch (_) {}
    }

    return this.getFallbackStory(language, level);
  }

  static async evaluateRoleplayResponse(userMsg: string, scenarioTitle: string, language: Language): Promise<{ feedback: string; fluencyScore: number; grammarScore: number }> {
    const key = this.getActiveGeminiKey();

    if (key && !key.includes('DummyKey')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`;
        const prompt = `Analyze this student message in ${language} for roleplay scenario "${scenarioTitle}": "${userMsg}".
Return strictly a JSON object with keys:
- "feedback": 1-2 sentence evaluation in English with tips
- "fluencyScore": number from 50 to 100
- "grammarScore": number from 50 to 100

Do not include markdown code blocks.`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, responseMimeType: 'application/json' }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const clean = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          return {
            feedback: parsed.feedback || 'Great attempt! Excellent use of context vocabulary.',
            fluencyScore: parsed.fluencyScore || 88,
            grammarScore: parsed.grammarScore || 92,
          };
        }
      } catch (_) {}
    }

    return {
      feedback: `Good effort! Your response fits well in the ${scenarioTitle} scenario.`,
      fluencyScore: 85,
      grammarScore: 90,
    };
  }

  private static getFallbackStory(language: Language, level: string): Story {
    if (language === 'French') {
      return {
        title: 'Le Café du Matin',
        titleTranslation: 'The Morning Coffee',
        level: level as any,
        content: "Marie entre dans un petit café à Paris. Elle commande un café au lait et un petit pain chaud. Le serveur lui dit 'Passez une bonne journée!'",
        contentTranslation: "Marie enters a small cafe in Paris. She orders a coffee with milk and a warm roll. The waiter tells her 'Have a good day!'",
        vocabHints: { 'café au lait': 'coffee with milk', 'serveur': 'waiter', 'journée': 'day' },
        questions: [
          {
            question: 'Qu\'est-ce que Marie commande au café?',
            options: ['Un thé et une pomme', 'Un café au lait et un petit pain', 'Un jus d\'orange'],
            correctIndex: 1,
          }
        ]
      };
    }
    return {
      title: 'El Viaje a Madrid',
      titleTranslation: 'The Trip to Madrid',
      level: level as any,
      content: "Carlos viaja a Madrid en avión. El día es soleado y la ciudad es hermosa. Él come tapas deliciosas.",
      contentTranslation: "Carlos travels to Madrid by plane. The day is sunny and the city is beautiful. He eats delicious tapas.",
      vocabHints: { 'avión': 'plane', 'soleado': 'sunny', 'hermosa': 'beautiful' },
      questions: [
        {
          question: '¿Cómo viaja Carlos a Madrid?',
          options: ['En tren', 'En avión', 'En coche'],
          correctIndex: 1,
        }
      ]
    };
  }
}
