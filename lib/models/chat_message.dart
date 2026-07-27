class ChatMessage {
  final String id;
  final String text;
  final String? translation;
  final String? correction;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.id,
    required this.text,
    this.translation,
    this.correction,
    required this.isUser,
    required this.timestamp,
  });

  factory ChatMessage.fromMap(Map<String, dynamic> map) {
    return ChatMessage(
      id: map['id'] ?? DateTime.now().millisecondsSinceEpoch.toString(),
      text: map['text'] ?? '',
      translation: map['translation'],
      correction: map['correction'],
      isUser: map['isUser'] ?? false,
      timestamp: map['timestamp'] != null
          ? DateTime.fromMillisecondsSinceEpoch(map['timestamp'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'text': text,
      if (translation != null) 'translation': translation,
      if (correction != null) 'correction': correction,
      'isUser': isUser,
      'timestamp': timestamp.millisecondsSinceEpoch,
    };
  }
}
