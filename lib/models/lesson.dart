class LessonModel {
  final String id;
  final String categoryId;
  final String sourceWord;
  final String translation;
  final String phonetic;
  final String audioLocale;
  final String? cachedSentence;
  final String? cachedSentenceTranslation;

  LessonModel({
    required this.id,
    required this.categoryId,
    required this.sourceWord,
    required this.translation,
    required this.phonetic,
    required this.audioLocale,
    this.cachedSentence,
    this.cachedSentenceTranslation,
  });

  factory LessonModel.fromMap(String id, Map<String, dynamic> map) {
    return LessonModel(
      id: id,
      categoryId: map['categoryId'] ?? '',
      sourceWord: map['source_word'] ?? map['sourceWord'] ?? '',
      translation: map['translation'] ?? '',
      phonetic: map['phonetic'] ?? '',
      audioLocale: map['audio_locale'] ?? map['audioLocale'] ?? 'fr-FR',
      cachedSentence: map['cachedSentence'],
      cachedSentenceTranslation: map['cachedSentenceTranslation'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'categoryId': categoryId,
      'source_word': sourceWord,
      'translation': translation,
      'phonetic': phonetic,
      'audio_locale': audioLocale,
      if (cachedSentence != null) 'cachedSentence': cachedSentence,
      if (cachedSentenceTranslation != null)
        'cachedSentenceTranslation': cachedSentenceTranslation,
    };
  }

  LessonModel copyWith({
    String? cachedSentence,
    String? cachedSentenceTranslation,
  }) {
    return LessonModel(
      id: id,
      categoryId: categoryId,
      sourceWord: sourceWord,
      translation: translation,
      phonetic: phonetic,
      audioLocale: audioLocale,
      cachedSentence: cachedSentence ?? this.cachedSentence,
      cachedSentenceTranslation: cachedSentenceTranslation ?? this.cachedSentenceTranslation,
    );
  }
}
