import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class GeminiExampleResult {
  final String sentence;
  final String translation;

  GeminiExampleResult({required this.sentence, required this.translation});
}

class GeminiService {
  /// Generates ONE example sentence and translation for a given word using Gemini API.
  static Future<GeminiExampleResult> generateExampleSentence({
    required String word,
    required String targetTranslation,
    required String language,
  }) async {
    final apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';

    if (apiKey.isEmpty || apiKey.contains('DummyKey')) {
      return _generateFallback(word, targetTranslation, language);
    }

    try {
      final url = Uri.parse(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=$apiKey',
      );

      final prompt =
          'Provide exactly ONE natural example sentence using the $language word "$word" (which means "$targetTranslation"), along with its English translation. Return strictly a JSON object with keys "sentence" and "translation". Do not include markdown code block syntax or surrounding quotes.';

      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'contents': [
                {
                  'parts': [
                    {'text': prompt}
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

        return GeminiExampleResult(
          sentence: jsonResult['sentence'] ?? '$word est un mot très utile.',
          translation: jsonResult['translation'] ?? '$targetTranslation is a very useful word.',
        );
      }
    } catch (_) {
      // Fallback on network/API failure
    }

    return _generateFallback(word, targetTranslation, language);
  }

  static GeminiExampleResult _generateFallback(String word, String translation, String language) {
    if (language.toLowerCase().contains('french') || word == 'bonjour' || word == 'merci' || word == 'voyage') {
      if (word == 'bonjour') {
        return GeminiExampleResult(
          sentence: 'Bonjour! Comment allez-vous aujourd\'hui?',
          translation: 'Hello! How are you doing today?',
        );
      } else if (word == 'merci') {
        return GeminiExampleResult(
          sentence: 'Merci beaucoup pour votre aide précieux.',
          translation: 'Thank you very much for your valuable help.',
        );
      } else if (word == 'voyage') {
        return GeminiExampleResult(
          sentence: 'Nous préparons un magnifique voyage à Paris.',
          translation: 'We are preparing a wonderful trip to Paris.',
        );
      }
      return GeminiExampleResult(
        sentence: 'J\'utilise le mot "$word" tous les jours.',
        translation: 'I use the word "$translation" every day.',
      );
    }

    return GeminiExampleResult(
      sentence: 'El uso de "$word" es muy importante.',
      translation: 'The use of "$translation" is very important.',
    );
  }
}
