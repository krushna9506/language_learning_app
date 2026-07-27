import '../models/lesson.dart';
import '../models/user_progress.dart';

/// Leitner Spaced-Repetition Service.
///
/// Implements a 5-box spaced-repetition algorithm:
/// - Box 1: Daily review (new or recently missed words)
/// - Box 2: Review every 2 days
/// - Box 3: Review every 4 days
/// - Box 4: Review every 7 days
/// - Box 5: Mastered (Review every 14 days)
class LeitnerService {
  /// Calculates the next Leitner box level based on outcome.
  ///
  /// On successful review/quiz/pronunciation: Box advances by +1 (max Box 5).
  /// On failure/incorrect attempt: Box resets to Box 1.
  static int computeNextBox({required int currentBox, required bool isSuccess}) {
    if (!isSuccess) {
      return 1; // Drop to box 1 on failure
    }
    return (currentBox + 1).clamp(1, 5); // Advance up to box 5
  }

  /// Calculates interval in days until next review for a given Leitner box level.
  static int getReviewIntervalDays(int box) {
    switch (box) {
      case 1:
        return 1; // Daily
      case 2:
        return 2; // Every 2 days
      case 3:
        return 4; // Every 4 days
      case 4:
        return 7; // Every 7 days
      case 5:
        return 14; // Mastered - every 2 weeks
      default:
        return 1;
    }
  }

  /// Evaluates whether a lesson is currently due for review based on last review date and Leitner box.
  static bool isLessonDue(UserProgressModel progress) {
    if (progress.lastReviewed == null) return true; // Never reviewed -> due

    final daysInterval = getReviewIntervalDays(progress.leitnerBox);
    final nextDueDate = progress.lastReviewed!.add(Duration(days: daysInterval));

    return DateTime.now().isAfter(nextDueDate);
  }

  /// Prioritizes a list of lessons for the Daily Review Queue based on Leitner system:
  /// 1. Unreviewed or overdue lessons sorted by lowest Box first (Box 1 -> Box 5).
  /// 2. Tiebreaker by oldest lastReviewed date.
  static List<LessonModel> prioritizeQueue({
    required List<LessonModel> lessons,
    required Map<String, UserProgressModel> progressMap,
  }) {
    final sorted = List<LessonModel>.from(lessons);

    sorted.sort((a, b) {
      final progA = progressMap[a.id] ?? UserProgressModel(lessonId: a.id);
      final progB = progressMap[b.id] ?? UserProgressModel(lessonId: b.id);

      final isDueA = isLessonDue(progA);
      final isDueB = isLessonDue(progB);

      // Prioritize due items over non-due items
      if (isDueA != isDueB) {
        return isDueA ? -1 : 1;
      }

      // Prioritize lower box numbers first (Box 1 needs more urgent attention)
      if (progA.leitnerBox != progB.leitnerBox) {
        return progA.leitnerBox.compareTo(progB.leitnerBox);
      }

      // Compare last reviewed dates (older first)
      if (progA.lastReviewed == null) return -1;
      if (progB.lastReviewed == null) return 1;
      return progA.lastReviewed!.compareTo(progB.lastReviewed!);
    });

    return sorted;
  }
}
