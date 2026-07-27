import 'package:flutter_test/flutter_test.dart';
import 'package:language_learning_app/services/levenshtein.dart';
import 'package:language_learning_app/services/leitner_service.dart';

void main() {
  group('Levenshtein Scoring Tests', () {
    test('Exact match returns 100% similarity', () {
      final score = LevenshteinScorer.calculateSimilarity('bonjour', 'bonjour');
      expect(score, equals(100.0));
    });

    test('Minor typo returns high similarity (>70%)', () {
      final score = LevenshteinScorer.calculateSimilarity('bonjour', 'bonjoor');
      expect(score, greaterThanOrEqualTo(70.0));
    });

    test('Completely different string returns low similarity (<50%)', () {
      final score = LevenshteinScorer.calculateSimilarity('bonjour', 'cat');
      expect(score, lessThan(50.0));
    });
  });

  group('Leitner Spaced Repetition Logic Tests', () {
    test('Success advances box up to 5', () {
      expect(LeitnerService.computeNextBox(currentBox: 1, isSuccess: true), equals(2));
      expect(LeitnerService.computeNextBox(currentBox: 4, isSuccess: true), equals(5));
      expect(LeitnerService.computeNextBox(currentBox: 5, isSuccess: true), equals(5));
    });

    test('Failure drops box back to 1', () {
      expect(LeitnerService.computeNextBox(currentBox: 4, isSuccess: false), equals(1));
    });
  });
}
