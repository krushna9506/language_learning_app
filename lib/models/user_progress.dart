class UserProgressModel {
  final String lessonId;
  final int leitnerBox; // 1 to 5
  final double pronunciationScore; // 0 to 100
  final double quizScore; // 0 to 100
  final DateTime? lastReviewed;

  UserProgressModel({
    required this.lessonId,
    this.leitnerBox = 1,
    this.pronunciationScore = 0.0,
    this.quizScore = 0.0,
    this.lastReviewed,
  });

  bool get isMastered => quizScore >= 70.0 && pronunciationScore >= 70.0;

  factory UserProgressModel.fromMap(String lessonId, Map<String, dynamic> map) {
    DateTime? lastRev;
    if (map['lastReviewed'] is String) {
      lastRev = DateTime.tryParse(map['lastReviewed']);
    } else if (map['lastReviewed'] is DateTime) {
      lastRev = map['lastReviewed'];
    }

    return UserProgressModel(
      lessonId: lessonId,
      leitnerBox: (map['leitnerBox'] as num?)?.toInt() ?? 1,
      pronunciationScore: (map['pronunciationScore'] as num?)?.toDouble() ?? 0.0,
      quizScore: (map['quizScore'] as num?)?.toDouble() ?? 0.0,
      lastReviewed: lastRev,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'leitnerBox': leitnerBox,
      'pronunciationScore': pronunciationScore,
      'quizScore': quizScore,
      'lastReviewed': lastReviewed?.toIso8601String(),
    };
  }
}
