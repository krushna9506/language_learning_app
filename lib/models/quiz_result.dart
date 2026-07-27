class QuizResultModel {
  final String id;
  final String categoryId;
  final int score;
  final int total;
  final DateTime completedAt;

  QuizResultModel({
    required this.id,
    required this.categoryId,
    required this.score,
    required this.total,
    required this.completedAt,
  });

  factory QuizResultModel.fromMap(String id, Map<String, dynamic> map) {
    DateTime time = DateTime.now();
    if (map['completedAt'] is String) {
      time = DateTime.tryParse(map['completedAt']) ?? DateTime.now();
    } else if (map['completedAt'] is DateTime) {
      time = map['completedAt'];
    }

    return QuizResultModel(
      id: id,
      categoryId: map['categoryId'] ?? '',
      score: (map['score'] as num?)?.toInt() ?? 0,
      total: (map['total'] as num?)?.toInt() ?? 0,
      completedAt: time,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'categoryId': categoryId,
      'score': score,
      'total': total,
      'completedAt': completedAt.toIso8601String(),
    };
  }
}
