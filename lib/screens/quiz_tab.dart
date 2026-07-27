import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:provider/provider.dart';
import '../models/category.dart';
import '../models/lesson.dart';
import '../providers/gamification_provider.dart';
import '../providers/learning_provider.dart';
import '../providers/theme_provider.dart';

class QuizTab extends StatefulWidget {
  const QuizTab({super.key});

  @override
  State<QuizTab> createState() => _QuizTabState();
}

class _QuizTabState extends State<QuizTab> {
  CategoryModel? _selectedCategory;
  int _questionIndex = 0;
  int _score = 0;
  String? _selectedOption;
  bool _quizCompleted = false;
  int _timerSeconds = 15;
  Timer? _countdownTimer;

  List<LessonModel> _quizLessons = [];
  List<String> _currentOptions = [];

  List<String> _passedLessons = [];
  List<String> _failedLessons = [];

  void _startQuiz(CategoryModel cat) {
    final learning = Provider.of<LearningProvider>(context, listen: false);
    final catLessons = learning.lessons.where((l) => l.categoryId == cat.id).toList();

    if (catLessons.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No lessons available for this category yet.')),
      );
      return;
    }

    setState(() {
      _selectedCategory = cat;
      _questionIndex = 0;
      _score = 0;
      _quizCompleted = false;
      _quizLessons = catLessons;
      _passedLessons = [];
      _failedLessons = [];
    });

    _loadQuestion();
  }

  void _loadQuestion() {
    if (_questionIndex >= _quizLessons.length) {
      _finishQuiz();
      return;
    }

    final currentLesson = _quizLessons[_questionIndex];
    final learning = Provider.of<LearningProvider>(context, listen: false);

    // Pick 3 random wrong options
    final allTranslations = learning.lessons
        .where((l) => l.id != currentLesson.id)
        .map((l) => l.translation)
        .toSet()
        .toList();
    allTranslations.shuffle();

    final wrongChoices = allTranslations.take(3).toList();
    final options = [...wrongChoices, currentLesson.translation];
    options.shuffle();

    setState(() {
      _selectedOption = null;
      _currentOptions = options;
      _timerSeconds = 15;
    });

    _startTimer();
  }

  void _startTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_timerSeconds <= 1) {
        t.cancel();
        _onTimeExpired();
      } else {
        setState(() => _timerSeconds--);
      }
    });
  }

  void _onTimeExpired() {
    final currentLesson = _quizLessons[_questionIndex];
    _failedLessons.add(currentLesson.id);
    _advanceNextQuestion();
  }

  void _onOptionSelected(String option) {
    if (_selectedOption != null) return; // Prevent double select
    _countdownTimer?.cancel();

    final currentLesson = _quizLessons[_questionIndex];
    final isCorrect = option == currentLesson.translation;
    final gamification = Provider.of<GamificationProvider>(context, listen: false);

    setState(() {
      _selectedOption = option;
      if (isCorrect) {
        _score++;
        _passedLessons.add(currentLesson.id);
        gamification.addXp(10);
      } else {
        _failedLessons.add(currentLesson.id);
        gamification.deductHeart();
      }
    });
  }

  void _advanceNextQuestion() {
    _countdownTimer?.cancel();
    setState(() => _questionIndex++);
    _loadQuestion();
  }

  Future<void> _finishQuiz() async {
    _countdownTimer?.cancel();
    setState(() => _quizCompleted = true);

    final gamification = Provider.of<GamificationProvider>(context, listen: false);
    gamification.addXp(30);
    gamification.updateQuestProgress('quest_3', 1);

    if (_selectedCategory != null) {
      final learning = Provider.of<LearningProvider>(context, listen: false);
      // Immediately write results to Firestore so Learn tab progress rings update in real time!
      await learning.saveQuizResult(
        categoryId: _selectedCategory!.id,
        score: _score,
        total: _quizLessons.length,
        passedLessonIds: _passedLessons,
        failedLessonIds: _failedLessons,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final learning = Provider.of<LearningProvider>(context);
    final theme = Provider.of<ThemeProvider>(context);
    final categories = learning.categories;

    // View 1: Category Selection Screen
    if (_selectedCategory == null) {
      return Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Text(
                'Knowledge Quiz',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(height: 6),
              Text(
                'Select a category to test your mastery',
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.builder(
                  itemCount: categories.length,
                  itemBuilder: (ctx, idx) {
                    final cat = categories[idx];
                    final progressPct = learning.getCategoryMasteryProgress(cat.id);

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        title: Text(
                          cat.title,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        subtitle: Text('${(progressPct * 100).toInt()}% Mastered'),
                        trailing: ElevatedButton(
                          onPressed: () => _startQuiz(cat),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.accentColor,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Start Quiz'),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      );
    }

    // View 2: Quiz Results Screen (with Lottie confetti on 100%)
    if (_quizCompleted) {
      final isPerfect = _score == _quizLessons.length && _quizLessons.isNotEmpty;

      return Scaffold(
        body: Stack(
          children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isPerfect ? Icons.emoji_events : Icons.stars,
                      size: 80,
                      color: isPerfect ? Colors.amber : theme.accentColor,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      isPerfect ? 'PERFECT SCORE! 🎉' : 'Quiz Complete!',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'You scored $_score out of ${_quizLessons.length} correct',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Results synced to Firestore in real-time!',
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                    const SizedBox(height: 30),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _selectedCategory = null);
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Back to Quizzes'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.accentColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Lottie Confetti Animation on 100% Score
            if (isPerfect)
              Positioned.fill(
                child: IgnorePointer(
                  child: Lottie.network(
                    'https://assets10.lottiefiles.com/packages/lf20_u4yrau.json',
                    errorBuilder: (context, error, stackTrace) {
                      return const SizedBox.shrink(); // Graceful fallback if offline
                    },
                    fit: BoxFit.cover,
                  ),
                ),
              ),
          ],
        ),
      );
    }

    // View 3: Active Quiz Question View
    final currentLesson = _quizLessons[_questionIndex];

    return Scaffold(
      appBar: AppBar(
        title: Text('${_selectedCategory?.title} Quiz'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => setState(() => _selectedCategory = null),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Question & Timer Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Question ${_questionIndex + 1} of ${_quizLessons.length}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _timerSeconds <= 5 ? Colors.red.shade50 : Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.timer,
                          size: 16,
                          color: _timerSeconds <= 5 ? Colors.red : Colors.blue,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${_timerSeconds}s',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: _timerSeconds <= 5 ? Colors.red : Colors.blue,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),

              // Question Card
              Card(
                elevation: 3,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    children: [
                      const Text(
                        'What is the translation of:',
                        style: TextStyle(color: Colors.grey),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '"${currentLesson.sourceWord}"',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: theme.accentColor,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Options List
              ..._currentOptions.map((opt) {
                final isSelected = _selectedOption == opt;
                final isCorrect = opt == currentLesson.translation;

                Color? btnColor;
                if (_selectedOption != null) {
                  if (isCorrect) {
                    btnColor = Colors.green.shade100;
                  } else if (isSelected) {
                    btnColor = Colors.red.shade100;
                  }
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: OutlinedButton(
                    onPressed: () => _onOptionSelected(opt),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(18),
                      backgroundColor: btnColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      opt,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                );
              }),

              const Spacer(),

              if (_selectedOption != null)
                ElevatedButton(
                  onPressed: _advanceNextQuestion,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.accentColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    _questionIndex == _quizLessons.length - 1 ? 'Finish Quiz' : 'Next Question',
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}
