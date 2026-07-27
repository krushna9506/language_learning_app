# Lingua Pop

Gamified lesson/quiz app with TTS, resilient phonetic fallback, Spark Firestore progress, and free LottieFiles confetti.

Configure Firebase with `flutterfire configure`; enable Firestore and Anonymous Authentication, then initialize with generated `DefaultFirebaseOptions`. `flutter_tts` integration is in `LessonPage.play()`; its catch path exposes phonetics. Lottie integration is the `Lottie.network` overlay in `QuizPage` when score is 3/3.

Run `flutter build web`; record Chrome while completing all three questions correctly to capture the confetti.
