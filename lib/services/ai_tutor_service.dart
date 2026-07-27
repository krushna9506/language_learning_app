import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';

class AiTutorResponse {
  final String reply;
  final String translation;
  final String? correction;

  AiTutorResponse({
    required this.reply,
    required this.translation,
    this.correction,
  });
}

class AiTutorService {
  /// Send user message to AI Language Tutor (Gemini 2.5 Flash Lite) with target language context.
  static Future<AiTutorResponse> chatWithTutor({
    required String userMessage,
    required String targetLanguage,
    required List<ChatMessage> conversationHistory,
  }) async {
    final apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';

    if (apiKey.isNotEmpty && !apiKey.contains('DummyKey')) {
      try {
        final url = Uri.parse(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=$apiKey',
        );

        final systemPrompt = '''
You are "LinguaAI", an encouraging, expert language tutor helping a student learn $targetLanguage.
Respond to the student's message in $targetLanguage.
Return strictly a JSON object with 3 keys:
1. "reply": Your conversational response in $targetLanguage (1-3 sentences).
2. "translation": English translation of your reply.
3. "correction": If the user made any grammar or vocabulary mistake, provide a gentle correction tip in English. Otherwise return null.

Student message: "$userMessage"
''';

        final response = await http
            .post(
              url,
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode({
                'contents': [
                  {
                    'parts': [
                      {'text': systemPrompt}
                    ]
                  }
                ],
                'generationConfig': {
                  'temperature': 0.7,
                  'responseMimeType': 'application/json',
                }
              }),
            )
            .timeout(const Duration(seconds: 8));

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final text = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';
          final cleanText = text.trim().replaceAll('```json', '').replaceAll('```', '').trim();
          final jsonResult = jsonDecode(cleanText);

          return AiTutorResponse(
            reply: jsonResult['reply'] ?? 'Très bien! Continuons notre conversation.',
            translation: jsonResult['translation'] ?? 'Very good! Let us continue our conversation.',
            correction: jsonResult['correction'],
          );
        }
      } catch (_) {
        // Fall back gracefully to NLP rule engine
      }
    }

    return _generateFallbackReply(userMessage, targetLanguage);
  }

  static AiTutorResponse _generateFallbackReply(String message, String language) {
    final lower = message.toLowerCase();

    if (language.toLowerCase() == 'french') {
      if (lower.contains('bonjour') || lower.contains('hello') || lower.contains('hi')) {
        return AiTutorResponse(
          reply: 'Bonjour! Comment allez-vous aujourd\'hui?',
          translation: 'Hello! How are you doing today?',
          correction: lower.contains('hello') || lower.contains('hi')
              ? 'Tip: In French, use "Bonjour" for hello or "Salut" for hi!'
              : null,
        );
      } else if (lower.contains('comment') || lower.contains('ca va') || lower.contains('ça va')) {
        return AiTutorResponse(
          reply: 'Je vais très bien, merci! Qu\'aimeriez-vous apprendre aujourd\'hui?',
          translation: 'I am doing very well, thank you! What would you like to learn today?',
        );
      } else if (lower.contains('merci')) {
        return AiTutorResponse(
          reply: 'De rien! Vous faites de super progrès en français.',
          translation: 'You are welcome! You are making great progress in French.',
        );
      } else {
        return AiTutorResponse(
          reply: 'C\'est une excellente remarque! Le français est une belle langue. Continuons!',
          translation: 'That is an excellent point! French is a beautiful language. Let us continue!',
        );
      }
    } else if (language.toLowerCase() == 'spanish') {
      if (lower.contains('hola') || lower.contains('hello')) {
        return AiTutorResponse(
          reply: '¡Hola! ¿Cómo estás hoy?',
          translation: 'Hello! How are you today?',
        );
      }
      return AiTutorResponse(
        reply: '¡Muy bien! Estás practicando español de manera excelente.',
        translation: 'Very good! You are practicing Spanish excellently.',
      );
    } else {
      return AiTutorResponse(
        reply: 'Great job practicing $language! Keep sending messages to improve your fluency.',
        translation: 'Great job practicing $language! Keep sending messages to improve your fluency.',
      );
    }
  }
}
