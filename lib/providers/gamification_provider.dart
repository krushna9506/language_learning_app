import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class DailyQuest {
  final String id;
  final String title;
  final String description;
  final int target;
  int current;
  final int rewardXp;
  bool isCompleted;

  DailyQuest({
    required this.id,
    required this.title,
    required this.description,
    required this.target,
    this.current = 0,
    required this.rewardXp,
    this.isCompleted = false,
  });
}

class GamificationProvider extends ChangeNotifier {
  int _hearts = 5;
  final int _maxHearts = 5;
  int _xp = 120;
  final int _dailyGoalXp = 50;

  final List<DailyQuest> _quests = [
    DailyQuest(
      id: 'quest_1',
      title: 'First Step',
      description: 'Complete 3 flashcards in the Lesson tab',
      target: 3,
      current: 1,
      rewardXp: 20,
    ),
    DailyQuest(
      id: 'quest_2',
      title: 'AI Tutor Chat',
      description: 'Send 2 messages to your AI Language Tutor',
      target: 2,
      current: 0,
      rewardXp: 30,
    ),
    DailyQuest(
      id: 'quest_3',
      title: 'Quiz Master',
      description: 'Complete 1 Category Quiz',
      target: 1,
      current: 0,
      rewardXp: 50,
    ),
  ];

  GamificationProvider() {
    _loadState();
  }

  int get hearts => _hearts;
  int get maxHearts => _maxHearts;
  int get xp => _xp;
  int get dailyGoalXp => _dailyGoalXp;
  List<DailyQuest> get quests => _quests;

  String get leagueName {
    if (_xp >= 500) return 'Diamond League 💎';
    if (_xp >= 300) return 'Sapphire League 🔷';
    if (_xp >= 200) return 'Gold League 🏆';
    if (_xp >= 100) return 'Silver League 🥈';
    return 'Bronze League 🥉';
  }

  double get xpProgressInCurrentLevel {
    return ((_xp % 100) / 100.0).clamp(0.0, 1.0);
  }

  void deductHeart() {
    if (_hearts > 0) {
      _hearts--;
      _saveState();
      notifyListeners();
    }
  }

  void refillHearts() {
    _hearts = _maxHearts;
    _saveState();
    notifyListeners();
  }

  void addXp(int amount) {
    _xp += amount;
    _saveState();
    notifyListeners();
  }

  void updateQuestProgress(String questId, int increment) {
    final index = _quests.indexWhere((q) => q.id == questId);
    if (index != -1) {
      final q = _quests[index];
      if (!q.isCompleted) {
        q.current = (q.current + increment).clamp(0, q.target);
        if (q.current >= q.target) {
          q.isCompleted = true;
          addXp(q.rewardXp);
        }
        notifyListeners();
      }
    }
  }

  Future<void> _loadState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _hearts = prefs.getInt('hearts') ?? 5;
      _xp = prefs.getInt('xp') ?? 120;
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _saveState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('hearts', _hearts);
      await prefs.setInt('xp', _xp);
    } catch (_) {}
  }
}
