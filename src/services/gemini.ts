import { ChatMessage, Language } from '../types';

export interface GeminiExampleResult {
  sentence: string;
  translation: string;
}

export interface AiTutorResponse {
  reply: string;
  translation: string;
  correction?: string;
}

export class GeminiService {
  static getApiKey(): string {
    // Check localStorage first (user-entered in Profile settings)
    try {
      const customKeys = localStorage.getItem('linguapop_api_keys');
      if (customKeys) {
        const parsed = JSON.parse(customKeys);
        if (parsed.geminiKey && parsed.geminiKey.trim().length > 5) {
          return parsed.geminiKey.trim();
        }
      }
    } catch (_) {}

    // Check Vite environment variable
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  static async generateExampleSentence(word: string, targetTranslation: string, language: Language): Promise<GeminiExampleResult> {
    const apiKey = this.getApiKey();

    if (apiKey && !apiKey.includes('DummyKey')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
        const prompt = `Provide exactly ONE natural example sentence using the ${language} word "${word}" (which means "${targetTranslation}"), along with its English translation. Return strictly a JSON object with keys "sentence" and "translation". Do not include markdown code blocks.`;

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
          const cleanText = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return {
            sentence: parsed.sentence || `${word} est un mot très utile.`,
            translation: parsed.translation || `${targetTranslation} is a very useful word.`,
          };
        }
      } catch (_) {}
    }

    return this.getFallbackSentence(word, targetTranslation, language);
  }

  /**
   * Full Gemini AI Chatbot with Multi-Turn Conversation Memory and General Knowledge Intelligence.
   * Can answer ANY question (general knowledge, language learning, translations, grammar, coding, culture).
   */
  static async chatWithGeminiMultiTurn(
    messageHistory: ChatMessage[],
    targetLanguage: Language
  ): Promise<AiTutorResponse> {
    const apiKey = this.getApiKey();

    if (apiKey && !apiKey.includes('DummyKey')) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

        // Format system instructions & conversation turns for Gemini REST API
        const systemInstructionText = `You are "Gemini AI", an intelligent, friendly AI assistant and expert ${targetLanguage} language tutor.
You can answer ANY user question on ANY topic (general knowledge, science, language learning, grammar, translations, coding, culture, advice) just like the official Gemini app.

Strict Output Format:
Return strictly a JSON object with 3 keys:
1. "reply": Your complete answer in ${targetLanguage} (can include general knowledge, detailed explanations, bullet points, or conversation).
2. "translation": Full, accurate English translation of your reply.
3. "correction": If the user made any grammar or spelling mistake in their input, provide a helpful correction tip in English. Otherwise return null.

Do not include markdown triple backticks around the JSON output.`;

        // Format contents array with turns
        const formattedContents = messageHistory.slice(-10).map((msg) => ({
          role: msg.isUser ? 'user' : 'model',
          parts: [{ text: msg.isUser ? msg.text : JSON.stringify({ reply: msg.text, translation: msg.translation || '' }) }],
        }));

        // Append system instructions to the latest turn prompt
        const lastIndex = formattedContents.length - 1;
        if (lastIndex >= 0) {
          const originalText = formattedContents[lastIndex].parts[0].text;
          formattedContents[lastIndex].parts[0].text = `${systemInstructionText}\n\nUser Message: "${originalText}"`;
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanText = text.trim().replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return {
            reply: parsed.reply || `I am here to help you learn ${targetLanguage} and answer any question!`,
            translation: parsed.translation || `I am here to help you learn ${targetLanguage} and answer any question!`,
            correction: parsed.correction || undefined,
          };
        }
      } catch (_) {}
    }

    const lastMsg = messageHistory[messageHistory.length - 1]?.text || '';
    return this.getFallbackChatReply(lastMsg, targetLanguage);
  }

  private static getFallbackSentence(word: string, translation: string, language: Language): GeminiExampleResult {
    if (language === 'French') {
      if (word === 'Bonjour') return { sentence: "Bonjour! Comment allez-vous aujourd'hui?", translation: "Hello! How are you doing today?" };
      if (word === 'Merci') return { sentence: "Merci beaucoup pour votre aide précieux.", translation: "Thank you very much for your valuable help." };
      return { sentence: `J'utilise le mot "${word}" tous les jours.`, translation: `I use the word "${translation}" every day.` };
    }
    if (language === 'Spanish') {
      if (word === 'Hola') return { sentence: "¡Hola! ¿Cómo estás hoy?", translation: "Hello! How are you today?" };
      return { sentence: `El uso de "${word}" es muy importante.`, translation: `The use of "${translation}" is very important.` };
    }
    return { sentence: `Using "${word}" is very helpful in ${language}.`, translation: `Using "${translation}" is very helpful.` };
  }

  private static getFallbackChatReply(message: string, language: Language): AiTutorResponse {
    const lower = message.toLowerCase();
    if (language === 'French') {
      if (lower.includes('bonjour') || lower.includes('hello')) {
        return { reply: "Bonjour! Je suis votre assistant IA Gemini. Comment puis-je vous aider aujourd'hui?", translation: "Hello! I am your Gemini AI assistant. How can I help you today?" };
      }
      return { reply: `Je peux répondre à n'importe quelle question en ${language}! N'hésitez pas à me poser des questions sur la grammaire, la culture ou les connaissances générales.`, translation: `I can answer any question in ${language}! Feel free to ask about grammar, culture, or general knowledge.` };
    }
    if (language === 'Spanish') {
      if (lower.includes('hola') || lower.includes('hello')) {
        return { reply: "¡Hola! Soy tu asistente IA Gemini. ¿En qué puedo ayudarte hoy?", translation: "Hello! I am your Gemini AI assistant. How can I help you today?" };
      }
      return { reply: `¡Puedo responder cualquier pregunta en español! Pregúntame sobre gramática, cultura o cualquier tema.`, translation: `I can answer any question in Spanish! Ask me about grammar, culture, or any topic.` };
    }
    return { reply: `I am your Gemini AI assistant! Ask me any question in ${language} or English.`, translation: `I am your Gemini AI assistant! Ask me any question.` };
  }
}
