import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../models/lesson.dart';
import '../models/user_progress.dart';
import '../providers/gamification_provider.dart';
import '../providers/learning_provider.dart';
import '../providers/theme_provider.dart';
import '../services/local_db_service.dart';
import '../services/gemini_service.dart';
import '../services/levenshtein.dart';

class LessonTab extends StatefulWidget {
  const LessonTab({super.key});

  @override
  State<LessonTab> createState() => _LessonTabState();
}

class _LessonTabState extends State<LessonTab> {
  final FlutterTts _tts = FlutterTts();
  final stt.SpeechToText _speech = stt.SpeechToText();

  int _currentIndex = 0;
  bool _showTtsFallback = false;
  bool _isGeneratingSentence = false;
  bool _isListening = false;
  String _speechResult = '';
  double? _lastPronunciationScore;
  bool _speechInitialized = false;

  @override
  void initState() {
    super.initState();
    _initTts();
    _initSpeech();
  }

  Future<void> _initTts() async {
    try {
      await _tts.setLanguage('fr-FR');
      await _tts.setSpeechRate(0.45);
    } catch (_) {
      if (mounted) setState(() => _showTtsFallback = true);
    }
  }

  Future<void> _initSpeech() async {
    try {
      _speechInitialized = await _speech.initialize(
        onError: (val) {},
        onStatus: (val) {},
      );
    } catch (_) {
      _speechInitialized = false;
    }
  }

  Future<void> _playAudio(LessonModel lesson) async {
    try {
      await _tts.setLanguage(lesson.audioLocale);
      final result = await _tts.speak(lesson.sourceWord);
      if (result == 0) {
        setState(() => _showTtsFallback = true);
      }
    } catch (_) {
      setState(() => _showTtsFallback = true);
    }
  }

  Future<void> _fetchExampleSentence(LessonModel lesson) async {
    if (lesson.cachedSentence != null && lesson.cachedSentence!.isNotEmpty) {
      return; // Already cached in Firestore
    }

    setState(() => _isGeneratingSentence = true);
    final learning = Provider.of<LearningProvider>(context, listen: false);

    final res = await GeminiService.generateExampleSentence(
      word: lesson.sourceWord,
      targetTranslation: lesson.translation,
      language: learning.targetLanguage,
    );

    // Cache generated sentence in local database
    final localDb = LocalDbService();
    await localDb.cacheGeneratedSentence(
      lessonId: lesson.id,
      sentence: res.sentence,
      translation: res.translation,
    );

    if (mounted) {
      setState(() => _isGeneratingSentence = false);
    }
  }

  void _startSpeakingPractice(LessonModel lesson) async {
    setState(() {
      _speechResult = '';
      _lastPronunciationScore = null;
    });

    if (!_speechInitialized) {
      await _initSpeech();
    }

    if (_speechInitialized && !_isListening) {
      setState(() => _isListening = true);
      _speech.listen(
        onResult: (val) {
          setState(() {
            _speechResult = val.recognizedWords;
            if (_speechResult.isNotEmpty) {
              _lastPronunciationScore = LevenshteinScorer.calculateSimilarity(
                lesson.sourceWord,
                _speechResult,
              );
            }
          });
        },
        listenOptions: stt.SpeechListenOptions(
          listenFor: const Duration(seconds: 6),
          pauseFor: const Duration(seconds: 2),
        ),
      );
    } else {
      // Fallback dialog if Speech Recognition isn't supported on current platform/browser
      _showSpeechFallbackDialog(lesson);
    }
  }

  void _stopListening(LessonModel lesson) {
    if (_isListening) {
      _speech.stop();
      setState(() => _isListening = false);
      if (_speechResult.isNotEmpty) {
        final score = LevenshteinScorer.calculateSimilarity(
          lesson.sourceWord,
          _speechResult,
        );
        setState(() => _lastPronunciationScore = score);

        // Record progress if score >= 70
        Provider.of<LearningProvider>(context, listen: false).recordAttempt(
          lessonId: lesson.id,
          isSuccess: score >= 70.0,
          pronunciationScore: score,
        );
      }
    }
  }

  void _showSpeechFallbackDialog(LessonModel lesson) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: const [
            Icon(Icons.mic, color: Colors.blue),
            SizedBox(width: 8),
            Text('Practice Pronunciation'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Target word: "${lesson.sourceWord}" (${lesson.phonetic})'),
            const SizedBox(height: 12),
            const Text(
              'Type what you pronounced to evaluate with Levenshtein distance:',
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'e.g. bonjour',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final text = controller.text.trim();
              Navigator.pop(ctx);
              if (text.isNotEmpty) {
                final score = LevenshteinScorer.calculateSimilarity(
                  lesson.sourceWord,
                  text,
                );
                setState(() {
                  _speechResult = text;
                  _lastPronunciationScore = score;
                });
                Provider.of<LearningProvider>(context, listen: false).recordAttempt(
                  lessonId: lesson.id,
                  isSuccess: score >= 70.0,
                  pronunciationScore: score,
                );
              }
            },
            child: const Text('Evaluate Score'),
          ),
        ],
      ),
    );
  }

  void _nextCard(bool markKnown) {
    final learning = Provider.of<LearningProvider>(context, listen: false);
    final gamification = Provider.of<GamificationProvider>(context, listen: false);
    final queue = learning.dailyReviewQueue;
    if (queue.isEmpty) return;

    final currentLesson = queue[_currentIndex % queue.length];
    learning.recordAttempt(
      lessonId: currentLesson.id,
      isSuccess: markKnown,
    );

    gamification.updateQuestProgress('quest_1', 1);

    setState(() {
      _currentIndex = (_currentIndex + 1) % queue.length;
      _lastPronunciationScore = null;
      _speechResult = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    final learning = Provider.of<LearningProvider>(context);
    final theme = Provider.of<ThemeProvider>(context);
    final queue = learning.dailyReviewQueue;

    if (queue.isEmpty) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle_outline, size: 64, color: Colors.green),
              const SizedBox(height: 16),
              Text(
                'All caught up!',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const Text('No pending flashcards in your daily Leitner queue.'),
            ],
          ),
        ),
      );
    }

    final lesson = queue[_currentIndex % queue.length];
    final UserProgressModel progress =
        learning.progressMap[lesson.id] ?? UserProgressModel(lessonId: lesson.id);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            children: [
              // Header indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Card ${_currentIndex + 1} of ${queue.length}',
                    style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade600),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.accentColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Leitner Box ${progress.leitnerBox} / 5',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: theme.accentColor,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Main Flashcard Container
              Expanded(
                child: Dismissible(
                  key: Key('card_${lesson.id}_$_currentIndex'),
                  onDismissed: (direction) {
                    final isKnown = direction == DismissDirection.startToEnd;
                    _nextCard(isKnown);
                  },
                  background: Container(
                    decoration: BoxDecoration(
                      color: Colors.green.shade100,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.only(left: 30),
                    child: const Icon(Icons.thumb_up, color: Colors.green, size: 40),
                  ),
                  secondaryBackground: Container(
                    decoration: BoxDecoration(
                      color: Colors.orange.shade100,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 30),
                    child: const Icon(Icons.refresh, color: Colors.orange, size: 40),
                  ),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Theme.of(context).cardColor,
                      borderRadius: BorderRadius.circular(28),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.08),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          lesson.sourceWord,
                          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.accentColor,
                              ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          lesson.translation,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Colors.grey.shade700,
                              ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Phonetic: [ ${lesson.phonetic} ]',
                          style: TextStyle(
                            fontStyle: FontStyle.italic,
                            color: Colors.grey.shade500,
                          ),
                        ),
                        if (_showTtsFallback)
                          Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.amber.shade50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Audio playback fallback mode active',
                                style: TextStyle(fontSize: 11, color: Colors.amber.shade900),
                              ),
                            ),
                          ),
                        const SizedBox(height: 20),

                        // Action Buttons: Audio, Gemini Sentence, Pronunciation
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          alignment: WrapAlignment.center,
                          children: [
                            OutlinedButton.icon(
                              onPressed: () => _playAudio(lesson),
                              icon: const Icon(Icons.volume_up_rounded),
                              label: Text(_showTtsFallback ? 'Phonetic' : 'Play Audio'),
                            ),
                            ElevatedButton.icon(
                              onPressed: _isGeneratingSentence
                                  ? null
                                  : () => _fetchExampleSentence(lesson),
                              icon: _isGeneratingSentence
                                  ? const SizedBox(
                                      width: 16,
                                      height: 16,
                                      child: CircularProgressIndicator(strokeWidth: 2),
                                    )
                                  : const Icon(Icons.auto_awesome, color: Colors.purple),
                              label: const Text('See Example Sentence'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.purple.shade50,
                                foregroundColor: Colors.purple.shade800,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Gemini Example Sentence Display Box
                        if (lesson.cachedSentence != null && lesson.cachedSentence!.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.purple.shade50.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.purple.shade100),
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    Icon(Icons.auto_awesome, size: 16, color: Colors.purple),
                                    SizedBox(width: 6),
                                    Text(
                                      'AI Example Sentence (Gemini)',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                        color: Colors.purple,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '"${lesson.cachedSentence}"',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                                if (lesson.cachedSentenceTranslation != null) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    lesson.cachedSentenceTranslation!,
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey.shade700,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // Speaking Practice & Levenshtein Score Section
                        OutlinedButton.icon(
                          onPressed: _isListening
                              ? () => _stopListening(lesson)
                              : () => _startSpeakingPractice(lesson),
                          icon: Icon(
                            _isListening ? Icons.stop_circle : Icons.mic_rounded,
                            color: _isListening ? Colors.red : theme.accentColor,
                          ),
                          label: Text(_isListening ? 'Stop Listening' : 'Practice Speaking'),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: _isListening ? Colors.red : theme.accentColor,
                            ),
                          ),
                        ),

                        if (_speechResult.isNotEmpty || _lastPronunciationScore != null) ...[
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: LevenshteinScorer.getScoreColor(
                                _lastPronunciationScore ?? 0.0,
                              ).withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  'Pronunciation Score: ${(_lastPronunciationScore ?? 0.0).toStringAsFixed(0)}%',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: LevenshteinScorer.getScoreColor(
                                      _lastPronunciationScore ?? 0.0,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  LevenshteinScorer.getScoreFeedbackLabel(
                                    _lastPronunciationScore ?? 0.0,
                                  ),
                                  style: const TextStyle(fontSize: 12),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Bottom Swipe / Action Buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _nextCard(false),
                      icon: const Icon(Icons.refresh_rounded, color: Colors.orange),
                      label: const Text('Needs Practice'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _nextCard(true),
                      icon: const Icon(Icons.check_circle_rounded),
                      label: const Text('Mark as Known'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.accentColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tts.stop();
    _speech.stop();
    super.dispose();
  }
}
