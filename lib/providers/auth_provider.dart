import 'package:flutter/material.dart';

class AuthProvider extends ChangeNotifier {
  final String _uid = "internship_demo_reviewer_2026";
  String _displayName = "Demo Reviewer";

  String get uid => _uid;
  String get displayName => _displayName;
  bool get isAuthenticated => true;
  bool get isDemoAccount => true;

  void setDisplayName(String name) {
    _displayName = name;
    notifyListeners();
  }

  Future<void> resetDemoData() async {
    await Future.delayed(const Duration(milliseconds: 300));
    notifyListeners();
  }
}
