import 'dart:math';
import 'package:flutter/material.dart';

/// Service implementing Levenshtein distance and pronunciation similarity scoring.
///
/// Converts speech-to-text string input into a normalized similarity score (0.0 to 100.0%)
/// compared against the target foreign word.
class LevenshteinScorer {
  /// Computes the Levenshtein edit distance between string [s1] and [s2].
  ///
  /// The edit distance is the minimum number of single-character edits
  /// (insertions, deletions, or substitutions) required to transform [s1] into [s2].
  static int computeDistance(String s1, String s2) {
    final str1 = s1.trim().toLowerCase();
    final str2 = s2.trim().toLowerCase();

    if (str1 == str2) return 0;
    if (str1.isEmpty) return str2.length;
    if (str2.isEmpty) return str1.length;

    List<int> previousRow = List<int>.generate(str2.length + 1, (i) => i);
    List<int> currentRow = List<int>.filled(str2.length + 1, 0);

    for (int i = 0; i < str1.length; i++) {
      currentRow[0] = i + 1;
      for (int j = 0; j < str2.length; j++) {
        final cost = (str1[i] == str2[j]) ? 0 : 1;
        currentRow[j + 1] = min(
          currentRow[j] + 1, // Insertion
          min(
            previousRow[j + 1] + 1, // Deletion
            previousRow[j] + cost, // Substitution
          ),
        );
      }
      for (int k = 0; k <= str2.length; k++) {
        previousRow[k] = currentRow[k];
      }
    }

    return previousRow[str2.length];
  }

  /// Calculates a percentage similarity score (0.0% to 100.0%) based on Levenshtein distance.
  ///
  /// [target]: The target foreign word/phrase.
  /// [attempt]: The speech recognition transcript result.
  static double calculateSimilarity(String target, String attempt) {
    final cleanTarget = target.trim().toLowerCase();
    final cleanAttempt = attempt.trim().toLowerCase();

    if (cleanTarget.isEmpty) return 0.0;
    if (cleanAttempt.isEmpty) return 0.0;
    if (cleanTarget == cleanAttempt) return 100.0;

    final distance = computeDistance(cleanTarget, cleanAttempt);
    final maxLen = max(cleanTarget.length, cleanAttempt.length);

    if (maxLen == 0) return 100.0;

    final similarityRatio = 1.0 - (distance / maxLen);
    final scorePercentage = (similarityRatio * 100.0).clamp(0.0, 100.0);
    return double.parse(scorePercentage.toStringAsFixed(1));
  }

  /// Returns the corresponding color feedback based on similarity score:
  /// - Green (>= 80%): High accuracy / Excellent pronunciation
  /// - Yellow (50% - 79%): Good effort / Needs minor polish
  /// - Red (< 50%): Needs practice
  static Color getScoreColor(double score) {
    if (score >= 80.0) {
      return const Color(0xFF4CAF50); // Vibrant Green
    } else if (score >= 50.0) {
      return const Color(0xFFFFB300); // Vibrant Amber / Yellow
    } else {
      return const Color(0xFFE53935); // Vibrant Red
    }
  }

  /// Human readable feedback label for the score.
  static String getScoreFeedbackLabel(double score) {
    if (score >= 90.0) return 'Native level! Fantastic!';
    if (score >= 80.0) return 'Great job! Clear pronunciation.';
    if (score >= 50.0) return 'Close attempt! Keep practicing.';
    return 'Needs practice! Try listening to audio again.';
  }
}
