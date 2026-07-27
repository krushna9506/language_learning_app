import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category.dart';
import '../models/lesson.dart';
import '../models/user_progress.dart';
import '../models/quiz_result.dart';

class LocalDbService {
  String _currentLanguage = 'French';

  // Multi-Language Categories
  final List<CategoryModel> _categories = [
    CategoryModel(id: 'vocab', title: 'Vocabulary', description: 'Essential everyday words', iconName: 'menu_book'),
    CategoryModel(id: 'grammar', title: 'Grammar', description: 'Verb tenses & sentence structure', iconName: 'auto_stories'),
    CategoryModel(id: 'travel', title: 'Travel', description: 'Airport, hotel, & navigation', iconName: 'flight_takeoff'),
    CategoryModel(id: 'dining', title: 'Food & Dining', description: 'Restaurants, menus & ordering', iconName: 'restaurant'),
    CategoryModel(id: 'daily', title: 'Daily Life', description: 'Routine conversations & greetings', iconName: 'chat'),
  ];

  // Comprehensive Multi-Language Datasets
  final Map<String, List<LessonModel>> _multiLanguageLessons = {
    'French': [
      // Vocab
      LessonModel(id: 'fr_bonjour', categoryId: 'vocab', sourceWord: 'Bonjour', translation: 'Hello / Good day', phonetic: 'bohn-zhoor', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_merci', categoryId: 'vocab', sourceWord: 'Merci', translation: 'Thank you', phonetic: 'mehr-see', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_chat', categoryId: 'vocab', sourceWord: 'Chat', translation: 'Cat', phonetic: 'shah', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_chien', categoryId: 'vocab', sourceWord: 'Chien', translation: 'Dog', phonetic: 'shee-en', audioLocale: 'fr-FR'),
      // Grammar
      LessonModel(id: 'fr_etre', categoryId: 'grammar', sourceWord: 'Être', translation: 'To be', phonetic: 'eh-truh', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_avoir', categoryId: 'grammar', sourceWord: 'Avoir', translation: 'To have', phonetic: 'ah-vwahr', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_aller', categoryId: 'grammar', sourceWord: 'Aller', translation: 'To go', phonetic: 'ah-lay', audioLocale: 'fr-FR'),
      // Travel
      LessonModel(id: 'fr_voyage', categoryId: 'travel', sourceWord: 'Voyage', translation: 'Trip / Travel', phonetic: 'vwah-yazh', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_passeport', categoryId: 'travel', sourceWord: 'Passeport', translation: 'Passport', phonetic: 'pahss-pohr', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_hotel', categoryId: 'travel', sourceWord: 'Hôtel', translation: 'Hotel', phonetic: 'oh-tel', audioLocale: 'fr-FR'),
      // Dining
      LessonModel(id: 'fr_menu', categoryId: 'dining', sourceWord: 'Menu', translation: 'Menu', phonetic: 'muh-nyoo', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_eau', categoryId: 'dining', sourceWord: 'Eau', translation: 'Water', phonetic: 'oh', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_pain', categoryId: 'dining', sourceWord: 'Pain', translation: 'Bread', phonetic: 'pan', audioLocale: 'fr-FR'),
      // Daily
      LessonModel(id: 'fr_salut', categoryId: 'daily', sourceWord: 'Salut', translation: 'Hi / Bye', phonetic: 'sah-lyoo', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_oui', categoryId: 'daily', sourceWord: 'Oui', translation: 'Yes', phonetic: 'wee', audioLocale: 'fr-FR'),
      LessonModel(id: 'fr_non', categoryId: 'daily', sourceWord: 'Non', translation: 'No', phonetic: 'noh', audioLocale: 'fr-FR'),
    ],

    'Spanish': [
      // Vocab
      LessonModel(id: 'es_hola', categoryId: 'vocab', sourceWord: 'Hola', translation: 'Hello', phonetic: 'oh-lah', audioLocale: 'es-ES'),
      LessonModel(id: 'es_gracias', categoryId: 'vocab', sourceWord: 'Gracias', translation: 'Thank you', phonetic: 'grah-see-ahs', audioLocale: 'es-ES'),
      LessonModel(id: 'es_gato', categoryId: 'vocab', sourceWord: 'Gato', translation: 'Cat', phonetic: 'gah-toh', audioLocale: 'es-ES'),
      LessonModel(id: 'es_perro', categoryId: 'vocab', sourceWord: 'Perro', translation: 'Dog', phonetic: 'peh-rroh', audioLocale: 'es-ES'),
      // Grammar
      LessonModel(id: 'es_ser', categoryId: 'grammar', sourceWord: 'Ser', translation: 'To be', phonetic: 'sehr', audioLocale: 'es-ES'),
      LessonModel(id: 'es_estar', categoryId: 'grammar', sourceWord: 'Estar', translation: 'To be (location/state)', phonetic: 'ehs-tahr', audioLocale: 'es-ES'),
      LessonModel(id: 'es_tener', categoryId: 'grammar', sourceWord: 'Tener', translation: 'To have', phonetic: 'teh-nehr', audioLocale: 'es-ES'),
      // Travel
      LessonModel(id: 'es_viaje', categoryId: 'travel', sourceWord: 'Viaje', translation: 'Trip / Travel', phonetic: 'vyah-heh', audioLocale: 'es-ES'),
      LessonModel(id: 'es_pasaporte', categoryId: 'travel', sourceWord: 'Pasaporte', translation: 'Passport', phonetic: 'pah-sah-pohr-teh', audioLocale: 'es-ES'),
      LessonModel(id: 'es_hotel', categoryId: 'travel', sourceWord: 'Hotel', translation: 'Hotel', phonetic: 'oh-tehl', audioLocale: 'es-ES'),
      // Dining
      LessonModel(id: 'es_menu', categoryId: 'dining', sourceWord: 'Menú', translation: 'Menu', phonetic: 'meh-noo', audioLocale: 'es-ES'),
      LessonModel(id: 'es_agua', categoryId: 'dining', sourceWord: 'Agua', translation: 'Water', phonetic: 'ah-gwah', audioLocale: 'es-ES'),
      LessonModel(id: 'es_pan', categoryId: 'dining', sourceWord: 'Pan', translation: 'Bread', phonetic: 'pahn', audioLocale: 'es-ES'),
      // Daily
      LessonModel(id: 'es_si', categoryId: 'daily', sourceWord: 'Sí', translation: 'Yes', phonetic: 'see', audioLocale: 'es-ES'),
      LessonModel(id: 'es_no', categoryId: 'daily', sourceWord: 'No', translation: 'No', phonetic: 'noh', audioLocale: 'es-ES'),
    ],

    'German': [
      // Vocab
      LessonModel(id: 'de_hallo', categoryId: 'vocab', sourceWord: 'Hallo', translation: 'Hello', phonetic: 'hah-loh', audioLocale: 'de-DE'),
      LessonModel(id: 'de_danke', categoryId: 'vocab', sourceWord: 'Danke', translation: 'Thank you', phonetic: 'dahn-kuh', audioLocale: 'de-DE'),
      LessonModel(id: 'de_katze', categoryId: 'vocab', sourceWord: 'Katze', translation: 'Cat', phonetic: 'kaht-suh', audioLocale: 'de-DE'),
      LessonModel(id: 'de_hund', categoryId: 'vocab', sourceWord: 'Hund', translation: 'Dog', phonetic: 'hoond', audioLocale: 'de-DE'),
      // Grammar
      LessonModel(id: 'de_sein', categoryId: 'grammar', sourceWord: 'Sein', translation: 'To be', phonetic: 'zayn', audioLocale: 'de-DE'),
      LessonModel(id: 'de_haben', categoryId: 'grammar', sourceWord: 'Haben', translation: 'To have', phonetic: 'hah-buhn', audioLocale: 'de-DE'),
      LessonModel(id: 'de_gehen', categoryId: 'grammar', sourceWord: 'Gehen', translation: 'To go', phonetic: 'gay-uhn', audioLocale: 'de-DE'),
      // Travel
      LessonModel(id: 'de_reise', categoryId: 'travel', sourceWord: 'Reise', translation: 'Trip / Travel', phonetic: 'rye-zuh', audioLocale: 'de-DE'),
      LessonModel(id: 'de_reisepass', categoryId: 'travel', sourceWord: 'Reisepass', translation: 'Passport', phonetic: 'rye-zuh-pahss', audioLocale: 'de-DE'),
      LessonModel(id: 'de_hotel', categoryId: 'travel', sourceWord: 'Hotel', translation: 'Hotel', phonetic: 'hoh-tel', audioLocale: 'de-DE'),
      // Dining
      LessonModel(id: 'de_karte', categoryId: 'dining', sourceWord: 'Speisekarte', translation: 'Menu', phonetic: 'shpahy-zuh-kahr-tuh', audioLocale: 'de-DE'),
      LessonModel(id: 'de_wasser', categoryId: 'dining', sourceWord: 'Wasser', translation: 'Water', phonetic: 'vahs-suhr', audioLocale: 'de-DE'),
      LessonModel(id: 'de_brot', categoryId: 'dining', sourceWord: 'Brot', translation: 'Bread', phonetic: 'broht', audioLocale: 'de-DE'),
      // Daily
      LessonModel(id: 'de_ja', categoryId: 'daily', sourceWord: 'Ja', translation: 'Yes', phonetic: 'yah', audioLocale: 'de-DE'),
      LessonModel(id: 'de_nein', categoryId: 'daily', sourceWord: 'Nein', translation: 'No', phonetic: 'nine', audioLocale: 'de-DE'),
    ],

    'Italian': [
      // Vocab
      LessonModel(id: 'it_ciao', categoryId: 'vocab', sourceWord: 'Ciao', translation: 'Hello / Bye', phonetic: 'chow', audioLocale: 'it-IT'),
      LessonModel(id: 'it_grazie', categoryId: 'vocab', sourceWord: 'Grazie', translation: 'Thank you', phonetic: 'grah-tsee-eh', audioLocale: 'it-IT'),
      LessonModel(id: 'it_gatto', categoryId: 'vocab', sourceWord: 'Gatto', translation: 'Cat', phonetic: 'gaht-toh', audioLocale: 'it-IT'),
      LessonModel(id: 'it_cane', categoryId: 'vocab', sourceWord: 'Cane', translation: 'Dog', phonetic: 'kah-neh', audioLocale: 'it-IT'),
      // Grammar
      LessonModel(id: 'it_essere', categoryId: 'grammar', sourceWord: 'Essere', translation: 'To be', phonetic: 'ehs-seh-reh', audioLocale: 'it-IT'),
      LessonModel(id: 'it_avere', categoryId: 'grammar', sourceWord: 'Avere', translation: 'To have', phonetic: 'ah-veh-reh', audioLocale: 'it-IT'),
      // Travel
      LessonModel(id: 'it_viaggio', categoryId: 'travel', sourceWord: 'Viaggio', translation: 'Trip / Travel', phonetic: 'vyahd-joh', audioLocale: 'it-IT'),
      LessonModel(id: 'it_passaporto', categoryId: 'travel', sourceWord: 'Passaporto', translation: 'Passport', phonetic: 'pahs-sah-pohr-toh', audioLocale: 'it-IT'),
      // Dining
      LessonModel(id: 'it_menu', categoryId: 'dining', sourceWord: 'Menu', translation: 'Menu', phonetic: 'meh-noo', audioLocale: 'it-IT'),
      LessonModel(id: 'it_acqua', categoryId: 'dining', sourceWord: 'Acqua', translation: 'Water', phonetic: 'ahk-wah', audioLocale: 'it-IT'),
      LessonModel(id: 'it_pane', categoryId: 'dining', sourceWord: 'Pane', translation: 'Bread', phonetic: 'pah-neh', audioLocale: 'it-IT'),
      // Daily
      LessonModel(id: 'it_si', categoryId: 'daily', sourceWord: 'Sì', translation: 'Yes', phonetic: 'see', audioLocale: 'it-IT'),
      LessonModel(id: 'it_no', categoryId: 'daily', sourceWord: 'No', translation: 'No', phonetic: 'noh', audioLocale: 'it-IT'),
    ],

    'Japanese': [
      // Vocab
      LessonModel(id: 'ja_konnichiwa', categoryId: 'vocab', sourceWord: 'こんにちは', translation: 'Hello', phonetic: 'Konnichiwa', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_arigatou', categoryId: 'vocab', sourceWord: 'ありがとう', translation: 'Thank you', phonetic: 'Arigatou', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_neko', categoryId: 'vocab', sourceWord: '猫 (ねこ)', translation: 'Cat', phonetic: 'Neko', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_inu', categoryId: 'vocab', sourceWord: '犬 (いぬ)', translation: 'Dog', phonetic: 'Inu', audioLocale: 'ja-JP'),
      // Grammar
      LessonModel(id: 'ja_desu', categoryId: 'grammar', sourceWord: 'です', translation: 'To be (is/am/are)', phonetic: 'Desu', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_iku', categoryId: 'grammar', sourceWord: '行く (いく)', translation: 'To go', phonetic: 'Iku', audioLocale: 'ja-JP'),
      // Travel
      LessonModel(id: 'ja_ryokou', categoryId: 'travel', sourceWord: '旅行 (りょこう)', translation: 'Trip / Travel', phonetic: 'Ryokou', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_pasupooto', categoryId: 'travel', sourceWord: 'パスポート', translation: 'Passport', phonetic: 'Pasupooto', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_hoteru', categoryId: 'travel', sourceWord: 'ホテル', translation: 'Hotel', phonetic: 'Hoteru', audioLocale: 'ja-JP'),
      // Dining
      LessonModel(id: 'ja_mizu', categoryId: 'dining', sourceWord: '水 (みず)', translation: 'Water', phonetic: 'Mizu', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_pan', categoryId: 'dining', sourceWord: 'パン', translation: 'Bread', phonetic: 'Pan', audioLocale: 'ja-JP'),
      // Daily
      LessonModel(id: 'ja_hai', categoryId: 'daily', sourceWord: 'はい', translation: 'Yes', phonetic: 'Hai', audioLocale: 'ja-JP'),
      LessonModel(id: 'ja_iie', categoryId: 'daily', sourceWord: 'いいえ', translation: 'No', phonetic: 'Iie', audioLocale: 'ja-JP'),
    ],

    'Mandarin': [
      // Vocab
      LessonModel(id: 'zh_nihao', categoryId: 'vocab', sourceWord: '你好', translation: 'Hello', phonetic: 'Nǐ hǎo', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_xiexie', categoryId: 'vocab', sourceWord: '谢谢', translation: 'Thank you', phonetic: 'Xiè xie', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_mao', categoryId: 'vocab', sourceWord: '猫', translation: 'Cat', phonetic: 'Māo', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_gou', categoryId: 'vocab', sourceWord: '狗', translation: 'Dog', phonetic: 'Gǒu', audioLocale: 'zh-CN'),
      // Grammar
      LessonModel(id: 'zh_shi', categoryId: 'grammar', sourceWord: '是', translation: 'To be', phonetic: 'Shì', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_you', categoryId: 'grammar', sourceWord: '有', translation: 'To have', phonetic: 'Yǒu', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_qu', categoryId: 'grammar', sourceWord: '去', translation: 'To go', phonetic: 'Qù', audioLocale: 'zh-CN'),
      // Travel
      LessonModel(id: 'zh_lvyou', categoryId: 'travel', sourceWord: '旅游', translation: 'Trip / Travel', phonetic: 'Lǚ yóu', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_huzhao', categoryId: 'travel', sourceWord: '护照', translation: 'Passport', phonetic: 'Hù zhào', audioLocale: 'zh-CN'),
      // Dining
      LessonModel(id: 'zh_shui', categoryId: 'dining', sourceWord: '水', translation: 'Water', phonetic: 'Shuǐ', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_mianbao', categoryId: 'dining', sourceWord: '面包', translation: 'Bread', phonetic: 'Miàn bāo', audioLocale: 'zh-CN'),
      // Daily
      LessonModel(id: 'zh_dui', categoryId: 'daily', sourceWord: '对', translation: 'Yes / Correct', phonetic: 'Duì', audioLocale: 'zh-CN'),
      LessonModel(id: 'zh_bu', categoryId: 'daily', sourceWord: '不', translation: 'No / Not', phonetic: 'Bù', audioLocale: 'zh-CN'),
    ],
  };

  final Map<String, UserProgressModel> _userProgress = {};
  final List<QuizResultModel> _quizResults = [];

  final _catController = StreamController<List<CategoryModel>>.broadcast();
  final _lesController = StreamController<List<LessonModel>>.broadcast();
  final _progController = StreamController<Map<String, UserProgressModel>>.broadcast();
  final _quizController = StreamController<List<QuizResultModel>>.broadcast();

  LocalDbService() {
    _loadState();
  }

  String get currentLanguage => _currentLanguage;

  void setLanguage(String lang) {
    if (_multiLanguageLessons.containsKey(lang)) {
      _currentLanguage = lang;
      _saveState();
      notifyControllers();
    }
  }

  void notifyControllers() {
    _catController.add(_categories);
    _lesController.add(getLessonsForCurrentLanguage());
    _progController.add(Map.from(_userProgress));
    _quizController.add(List.from(_quizResults));
  }

  List<LessonModel> getLessonsForCurrentLanguage() {
    return _multiLanguageLessons[_currentLanguage] ?? _multiLanguageLessons['French']!;
  }

  Stream<List<CategoryModel>> getCategoriesStream() {
    Timer.run(() => _catController.add(_categories));
    return _catController.stream;
  }

  Stream<List<LessonModel>> getLessonsStream() {
    Timer.run(() => _lesController.add(getLessonsForCurrentLanguage()));
    return _lesController.stream;
  }

  Stream<Map<String, UserProgressModel>> getUserProgressStream() {
    Timer.run(() => _progController.add(Map.from(_userProgress)));
    return _progController.stream;
  }

  Stream<List<QuizResultModel>> getQuizResultsStream() {
    Timer.run(() => _quizController.add(List.from(_quizResults)));
    return _quizController.stream;
  }

  Future<void> updateUserProgress({
    required String lessonId,
    int? leitnerBox,
    double? pronunciationScore,
    double? quizScore,
  }) async {
    final current = _userProgress[lessonId] ?? UserProgressModel(lessonId: lessonId);
    final updated = UserProgressModel(
      lessonId: lessonId,
      leitnerBox: leitnerBox ?? current.leitnerBox,
      pronunciationScore: pronunciationScore != null
          ? (pronunciationScore > current.pronunciationScore ? pronunciationScore : current.pronunciationScore)
          : current.pronunciationScore,
      quizScore: quizScore != null
          ? (quizScore > current.quizScore ? quizScore : current.quizScore)
          : current.quizScore,
      lastReviewed: DateTime.now(),
    );

    _userProgress[lessonId] = updated;
    _progController.add(Map.from(_userProgress));
    _saveState();
  }

  Future<void> saveQuizResult({
    required String categoryId,
    required int score,
    required int total,
  }) async {
    final result = QuizResultModel(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      categoryId: categoryId,
      score: score,
      total: total,
      completedAt: DateTime.now(),
    );
    _quizResults.insert(0, result);
    _quizController.add(List.from(_quizResults));
    _saveState();
  }

  Future<void> cacheGeneratedSentence({
    required String lessonId,
    required String sentence,
    required String translation,
  }) async {
    final currentLessons = getLessonsForCurrentLanguage();
    final index = currentLessons.indexWhere((l) => l.id == lessonId);
    if (index != -1) {
      currentLessons[index] = currentLessons[index].copyWith(
        cachedSentence: sentence,
        cachedSentenceTranslation: translation,
      );
      _lesController.add(List.from(currentLessons));
      _saveState();
    }
  }

  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _currentLanguage = prefs.getString('targetLanguage') ?? 'French';

      final progJson = prefs.getString('userProgress');
      if (progJson != null) {
        final Map<String, dynamic> decoded = jsonDecode(progJson);
        decoded.forEach((key, value) {
          _userProgress[key] = UserProgressModel.fromMap(key, Map<String, dynamic>.from(value));
        });
      }

      notifyControllers();
    } catch (_) {}
  }

  Future<void> _saveState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('targetLanguage', _currentLanguage);

      final Map<String, dynamic> progMap = {};
      _userProgress.forEach((key, value) {
        progMap[key] = {
          'leitnerBox': value.leitnerBox,
          'pronunciationScore': value.pronunciationScore,
          'quizScore': value.quizScore,
          'lastReviewed': value.lastReviewed?.toIso8601String(),
        };
      });
      await prefs.setString('userProgress', jsonEncode(progMap));
    } catch (_) {}
  }
}
