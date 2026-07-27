import 'dart:async';
import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/lesson.dart';
import '../models/quiz_result.dart';
import '../models/user_progress.dart';
import '../services/leitner_service.dart';
import '../services/local_db_service.dart';

class LearningProvider extends ChangeNotifier {
  final LocalDbService _dbService;

  List<CategoryModel> _categories = [];
  List<LessonModel> _lessons = [];
  Map<String, UserProgressModel> _progressMap = {};
  List<QuizResultModel> _quizResults = [];

  StreamSubscription? _catSub;
  StreamSubscription? _lesSub;
  StreamSubscription? _progSub;
  StreamSubscription? _quizSub;

  final int _streakCount = 1;

  LearningProvider(this._dbService) {
    initialize();
  }

  List<CategoryModel> get categories => _categories;
  List<LessonModel> get lessons => _lessons;
  Map<String, UserProgressModel> get progressMap => _progressMap;
  List<QuizResultModel> get quizResults => _quizResults;
  String get targetLanguage => _dbService.currentLanguage;
  int get streakCount => _streakCount;

  void setTargetLanguage(String lang) {
    _dbService.setLanguage(lang);
    notifyListeners();
  }

  void initialize([String? uid]) {
    _cancelSubscriptions();

    _catSub = _dbService.getCategoriesStream().listen((cats) {
      _categories = cats;
      notifyListeners();
    });

    _lesSub = _dbService.getLessonsStream().listen((less) {
      _lessons = less;
      notifyListeners();
    });

    _progSub = _dbService.getUserProgressStream().listen((prog) {
      _progressMap = prog;
      notifyListeners();
    });

    _quizSub = _dbService.getQuizResultsStream().listen((results) {
      _quizResults = results;
      notifyListeners();
    });
  }

  void _cancelSubscriptions() {
    _catSub?.cancel();
    _lesSub?.cancel();
    _progSub?.cancel();
    _quizSub?.cancel();
  }

  /// Calculates percentage (0.0 to 1.0) of mastered lessons for a category in real-time.
  double getCategoryMasteryProgress(String categoryId) {
    final catLessons = _lessons.where((l) => l.categoryId == categoryId).toList();
    if (catLessons.isEmpty) return 0.0;

    int masteredCount = 0;
    for (var l in catLessons) {
      final prog = _progressMap[l.id];
      if (prog != null && prog.isMastered) {
        masteredCount++;
      }
    }

    return (masteredCount / catLessons.length).clamp(0.0, 1.0);
  }

  /// Returns total count of words mastered across all categories.
  int get totalWordsMastered {
    int count = 0;
    for (var prog in _progressMap.values) {
      if (prog.isMastered) {
        count++;
      }
    }
    return count;
  }

  /// Prioritized daily lesson queue based on Leitner 5-box system.
  List<LessonModel> get dailyReviewQueue {
    return LeitnerService.prioritizeQueue(
      lessons: _lessons,
      progressMap: _progressMap,
    );
  }

  /// Calculates words learned per day for the last 14 days for fl_chart bar chart.
  Map<DateTime, int> get14DayStats() {
    final Map<DateTime, int> stats = {};
    final now = DateTime.now();

    for (int i = 13; i >= 0; i--) {
      final day = DateTime(now.year, now.month, now.day).subtract(Duration(days: i));
      stats[day] = 0;
    }

    for (var prog in _progressMap.values) {
      if (prog.lastReviewed != null) {
        final revDate = DateTime(
          prog.lastReviewed!.year,
          prog.lastReviewed!.month,
          prog.lastReviewed!.day,
        );
        if (stats.containsKey(revDate)) {
          stats[revDate] = (stats[revDate] ?? 0) + 1;
        }
      }
    }

    return stats;
  }

  /// Update user attempt on a lesson flashcard or pronunciation.
  Future<void> recordAttempt({
    required String lessonId,
    required bool isSuccess,
    double? pronunciationScore,
    double? quizScore,
  }) async {
    final currentProg = _progressMap[lessonId] ?? UserProgressModel(lessonId: lessonId);
    final nextBox = LeitnerService.computeNextBox(
      currentBox: currentProg.leitnerBox,
      isSuccess: isSuccess,
    );

    await _dbService.updateUserProgress(
      lessonId: lessonId,
      leitnerBox: nextBox,
      pronunciationScore: pronunciationScore,
      quizScore: quizScore,
    );
  }

  /// Save quiz result and update per-lesson quiz scores.
  Future<void> saveQuizResult({
    required String categoryId,
    required int score,
    required int total,
    required List<String> passedLessonIds,
    required List<String> failedLessonIds,
  }) async {
    final quizPct = total > 0 ? (score / total * 100.0) : 0.0;

    await _dbService.saveQuizResult(
      categoryId: categoryId,
      score: score,
      total: total,
    );

    for (var lId in passedLessonIds) {
      await recordAttempt(
        lessonId: lId,
        isSuccess: true,
        quizScore: quizPct,
      );
    }

    for (var lId in failedLessonIds) {
      await recordAttempt(
        lessonId: lId,
        isSuccess: false,
        quizScore: 0.0,
      );
    }
  }

  @override
  void dispose() {
    _cancelSubscriptions();
    super.dispose();
  }
}
